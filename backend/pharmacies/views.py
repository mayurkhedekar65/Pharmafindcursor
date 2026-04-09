from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from django.db.models import Sum, Count, F, Q
from django.conf import settings
from decimal import Decimal
import stripe

stripe.api_key = settings.STRIPE_SECRET_KEY

from .models import Medicine, Pharmacy, Reservation, Stock, UserProfile
from .serializers import (
    LoginSerializer,
    MedicineSerializer,
    MedicineSearchInputSerializer,
    MedicineSearchResultSerializer,
    PharmacySerializer,
    PharmacySignupSerializer,
    PharmacyUpdateSerializer,
    ReservationSerializer,
    StockCreateUpdateSerializer,
    StockListSerializer,
    UserSignupSerializer,
    PharmacyIntegrationSerializer,
    CreditCustomerSerializer,
    PrescriptionSerializer,
)
from .utils import identify_location, pharmacies_with_distances


@api_view(["POST"])
def medicine_search(request):
    """
    Search for a medicine by name and user location.

    - Accepts user_location (string) and medicine_name (string).
    - Performs case-insensitive, partial name matching.
    - Filters pharmacies where stock quantity > 0.
    - Sorts results by nearest distance.
    """
    input_serializer = MedicineSearchInputSerializer(data=request.data)
    if not input_serializer.is_valid():
        return Response(input_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user_location = input_serializer.validated_data.get("user_location") or ""
    medicine_name = input_serializer.validated_data.get("medicine_name") or ""

    if not str(medicine_name).strip():
        return Response(
            {"detail": "Medicine name cannot be empty."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        user_lat, user_lon, resolved_area = identify_location(user_location)
    except Exception:
        return Response(
            {"detail": "Could not resolve location. Please try another area or city in Goa."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        medicines = Medicine.objects.filter(name__icontains=medicine_name).order_by("name")
        if not medicines.exists():
            return Response(
                {
                    "detail": "No medicines found matching the given name.",
                    "resolved_location": resolved_area,
                },
                status=status.HTTP_200_OK,
            )

        medicine_ids = medicines.values_list("id", flat=True)
        stocks = (
            Stock.objects.select_related("pharmacy", "medicine")
            .filter(medicine_id__in=medicine_ids, quantity__gt=0)
            .all()
        )

        if not stocks:
            return Response(
                {
                    "detail": "No pharmacies have this medicine in stock.",
                    "resolved_location": resolved_area,
                },
                status=status.HTTP_200_OK,
            )

        pharmacies = {stock.pharmacy for stock in stocks}
        pharmacies_with_distance = pharmacies_with_distances(user_lat, user_lon, pharmacies)
        distance_by_pharmacy = {pharmacy.id: distance for pharmacy, distance in pharmacies_with_distance}

        results = []
        for stock in stocks:
            distance = distance_by_pharmacy.get(stock.pharmacy_id)
            if distance is None: continue
            
            # Use Stock prices if set, else Medicine defaults
            sell_price = stock.selling_price if stock.selling_price > 0 else stock.medicine.price

            results.append({
                "pharmacy_name": stock.pharmacy.name,
                "area": stock.pharmacy.area,
                "city": stock.pharmacy.city,
                "distance_km": round(float(distance), 2),
                "medicine_name": stock.medicine.name,
                "quantity": stock.quantity,
                "delivery_available": stock.pharmacy.delivery_available,
                "category": stock.medicine.category,
                "price": float(sell_price),
            })

        # Smart Alternative Suggestions: If results are few, look for AI-linked alternatives
        if len(results) < 3:
            search_meds = Medicine.objects.filter(name__icontains=medicine_name)
            for m in search_meds:
                alts = MedicineAlternative.objects.filter(medicine=m)
                for alt_rel in alts:
                    alt_stocks = Stock.objects.filter(medicine=alt_rel.alternative, quantity__gt=0).select_related("pharmacy", "medicine")
                    # Calculate distances for these new pharmacies
                    alt_pharmacies = {s.pharmacy for s in alt_stocks}
                    alt_dist_pairs = pharmacies_with_distances(user_lat, user_lon, alt_pharmacies)
                    alt_dist_map = {p.id: d for p, d in alt_dist_pairs}
                    
                    for as_ in alt_stocks:
                        d = alt_dist_map.get(as_.pharmacy_id)
                        if d is None: continue
                        results.append({
                            "pharmacy_name": as_.pharmacy.name,
                            "area": as_.pharmacy.area,
                            "city": as_.pharmacy.city,
                            "distance_km": round(float(d), 2),
                            "medicine_name": as_.medicine.name,
                            "quantity": as_.quantity,
                            "delivery_available": as_.pharmacy.delivery_available,
                            "category": as_.medicine.category,
                            "price": float(as_.selling_price if as_.selling_price > 0 else as_.medicine.price),
                            "is_alternative": True,
                            "alternative_reason": alt_rel.reason
                        })

        results.sort(key=lambda item: item["distance_km"])
        return Response({
                "resolved_location": resolved_area,
                "results": results,
                "searchParams": {"medicineName": medicine_name}
            },
            status=status.HTTP_200_OK
        )
    except Exception:
        return Response(
            {"detail": "Search failed. Please try again."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
def create_reservation(request):
    """
    Create a simple reservation for pickup or delivery.
    """
    serializer = ReservationSerializer(data=request.data)
    if serializer.is_valid():
        user = request.user if request.user.is_authenticated else None
        reservation = serializer.save(user=user)
        output_serializer = ReservationSerializer(reservation)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def user_reservations(request):
    """
    Get list of reservations for the logged-in user.
    """
    reservations = Reservation.objects.filter(user=request.user).order_by("-timestamp")
    serializer = ReservationSerializer(reservations, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def pharmacy_orders(request, pharmacy_id):
    """
    Get list of reservations for a specific pharmacy.
    """
    try:
        pharmacy = Pharmacy.objects.get(pk=pharmacy_id)
    except Pharmacy.DoesNotExist:
        return Response({"detail": "Pharmacy not found."}, status=status.HTTP_404_NOT_FOUND)

    reservations = Reservation.objects.filter(pharmacy=pharmacy).order_by("-timestamp")
    serializer = ReservationSerializer(reservations, many=True)
    return Response(serializer.data)


# ==================== AUTH APIs (USERS + PHARMACIES) ====================

@api_view(["POST"])
def user_signup(request):
    """
    Signup for a regular consumer user.
    """
    serializer = UserSignupSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    username = serializer.validated_data["username"]
    password = serializer.validated_data["password"]
    email = serializer.validated_data.get("email", "")

    try:
        user = User.objects.create_user(username=username, password=password, email=email)
        UserProfile.objects.create(user=user, role=UserProfile.ROLE_CONSUMER)
        
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
    except Exception:
        return Response(
            {"detail": "Account creation failed. Please try again."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return Response(
        {
            "token": access_token,
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "username": user.username,
                "role": UserProfile.ROLE_CONSUMER,
            },
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
def pharmacy_signup(request):
    """
    Signup for a pharmacy account.

    This creates:
    - A Django user
    - A Pharmacy record
    - A UserProfile linking the user and pharmacy
    """
    serializer = PharmacySignupSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    username = serializer.validated_data["username"]
    password = serializer.validated_data["password"]
    email = serializer.validated_data.get("email", "")

    try:
        user = User.objects.create_user(username=username, password=password, email=email)
    except Exception:
        return Response(
            {"detail": "Account creation failed. Please try again."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    try:
        pharmacy = Pharmacy.objects.create(
            name=serializer.validated_data["pharmacy_name"],
            area=serializer.validated_data["area"],
            city=serializer.validated_data["city"],
            latitude=serializer.validated_data["latitude"],
            longitude=serializer.validated_data["longitude"],
            contact=serializer.validated_data.get("contact", ""),
            delivery_available=serializer.validated_data.get("delivery_available", False),
        )
        UserProfile.objects.create(
            user=user,
            role=UserProfile.ROLE_PHARMACY,
            pharmacy=pharmacy,
        )
        
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
    except Exception as e:
        print(f"Pharmacy signup error: {e}")
        return Response(
            {"detail": "Account creation failed. Please try again."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return Response(
        {
            "token": access_token,
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "username": user.username,
                "role": UserProfile.ROLE_PHARMACY,
                "pharmacy_id": pharmacy.id,
            },
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
def login_view(request):
    """
    Simple login for both consumers and pharmacies.

    Returns an auth token and basic user info.
    """
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    username = serializer.validated_data["username"]
    password = serializer.validated_data["password"]

    user = authenticate(username=username, password=password)
    if user is None:
        return Response(
            {"detail": "Invalid username or password."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)

    role = None
    pharmacy_id = None
    try:
        profile = user.profile
        role = profile.role
        if profile.role == UserProfile.ROLE_PHARMACY and profile.pharmacy:
            pharmacy_id = profile.pharmacy.id
    except UserProfile.DoesNotExist:
        role = None

    return Response(
        {
            "token": access_token,
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "username": user.username,
                "role": role,
                "pharmacy_id": pharmacy_id,
            },
        },
        status=status.HTTP_200_OK,
    )


# ==================== PHARMACY PORTAL APIs ====================

@api_view(["GET"])
def list_pharmacies(request):
    """
    List all pharmacies (useful for pharmacy portal selection).
    """
    pharmacies = Pharmacy.objects.all().order_by("name")
    serializer = PharmacySerializer(pharmacies, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
def list_medicines(request):
    """
    List all medicines in the system.
    """
    medicines = Medicine.objects.all().order_by("name")
    serializer = MedicineSerializer(medicines, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET", "PUT"])
def pharmacy_profile(request, pharmacy_id):
    """
    Get or update pharmacy profile.

    GET: Retrieve pharmacy details
    PUT: Update pharmacy profile (name, area, city, coordinates, contact, delivery_available)
    """
    try:
        pharmacy = Pharmacy.objects.get(pk=pharmacy_id)
    except Pharmacy.DoesNotExist:
        return Response(
            {"detail": "Pharmacy not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    if request.method == "GET":
        serializer = PharmacySerializer(pharmacy)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == "PUT":
        serializer = PharmacyUpdateSerializer(pharmacy, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            output_serializer = PharmacySerializer(pharmacy)
            return Response(output_serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def pharmacy_stock_list(request, pharmacy_id):
    """
    Get list of all medicines and their stock quantities for a pharmacy.
    """
    try:
        pharmacy = Pharmacy.objects.get(pk=pharmacy_id)
    except Pharmacy.DoesNotExist:
        return Response(
            {"detail": "Pharmacy not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    stocks = Stock.objects.filter(pharmacy=pharmacy).select_related("medicine").all()
    serializer = StockListSerializer(stocks, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["POST"])
def add_medicine_to_pharmacy(request, pharmacy_id):
    """
    Add a medicine to a pharmacy's stock.

    If the medicine doesn't exist, it will be created.
    If stock already exists, it will be updated.
    """
    try:
        pharmacy = Pharmacy.objects.get(pk=pharmacy_id)
    except Pharmacy.DoesNotExist:
        return Response(
            {"detail": "Pharmacy not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    medicine_name = request.data.get("medicine_name", "").strip()
    medicine_description = request.data.get("medicine_description", "").strip()
    quantity = request.data.get("quantity", 0)

    if not medicine_name:
        return Response(
            {"detail": "Medicine name is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        quantity = int(quantity)
        if quantity < 0:
            raise ValueError("Quantity must be non-negative")
    except (ValueError, TypeError):
        return Response(
            {"detail": "Quantity must be a non-negative integer."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    category = request.data.get("category", "medicine")
    price = request.data.get("price", 0.00)

    # Get or create medicine
    medicine, created_med = Medicine.objects.get_or_create(
        name=medicine_name,
        defaults={
            "description": medicine_description,
            "category": category,
            "price": price
        },
    )
    
    if not created_med:
        # Update existing medicine details if provided
        if medicine_description:
            medicine.description = medicine_description
        medicine.category = category
        medicine.price = price
        medicine.save()

    batch_number = request.data.get("batch_number")
    expiry_date = request.data.get("expiry_date")
    low_stock_threshold = request.data.get("low_stock_threshold", 10)
    selling_price = request.data.get("selling_price", price)
    cost_price = request.data.get("cost_price", 0.00)

    # Get or create stock
    stock, created = Stock.objects.get_or_create(
        pharmacy=pharmacy,
        medicine=medicine,
        defaults={
            "quantity": quantity,
            "batch_number": batch_number,
            "expiry_date": expiry_date if expiry_date else None,
            "low_stock_threshold": low_stock_threshold,
            "selling_price": selling_price,
            "cost_price": cost_price
        },
    )

    if not created:
        # Update existing stock
        stock.quantity = quantity
        if batch_number:
            stock.batch_number = batch_number
        if expiry_date:
            stock.expiry_date = expiry_date
        stock.low_stock_threshold = low_stock_threshold
        stock.selling_price = selling_price
        stock.cost_price = cost_price
        stock.save()

    serializer = StockCreateUpdateSerializer(stock)
    return Response(
        serializer.data,
        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
    )


@api_view(["PUT"])
def update_stock_quantity(request, pharmacy_id, stock_id):
    """
    Update stock quantity for a specific medicine in a pharmacy.
    """
    try:
        pharmacy = Pharmacy.objects.get(pk=pharmacy_id)
    except Pharmacy.DoesNotExist:
        return Response(
            {"detail": "Pharmacy not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    try:
        stock = Stock.objects.get(pk=stock_id, pharmacy=pharmacy)
    except Stock.DoesNotExist:
        return Response(
            {"detail": "Stock entry not found for this pharmacy."},
            status=status.HTTP_404_NOT_FOUND,
        )

    quantity = request.data.get("quantity")
    if quantity is None:
        return Response(
            {"detail": "Quantity is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        quantity = int(quantity)
        if quantity < 0:
            raise ValueError("Quantity must be non-negative")
    except (ValueError, TypeError):
        return Response(
            {"detail": "Quantity must be a non-negative integer."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    stock.quantity = quantity
    stock.save()

    serializer = StockCreateUpdateSerializer(stock)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["DELETE"])
def remove_medicine_from_pharmacy(request, pharmacy_id, stock_id):
    """
    Remove a medicine from a pharmacy's stock (delete stock entry).
    """
    try:
        pharmacy = Pharmacy.objects.get(pk=pharmacy_id)
    except Pharmacy.DoesNotExist:
        return Response(
            {"detail": "Pharmacy not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    try:
        stock = Stock.objects.get(pk=stock_id, pharmacy=pharmacy)
    except Stock.DoesNotExist:
        return Response(
            {"detail": "Stock entry not found for this pharmacy."},
            status=status.HTTP_404_NOT_FOUND,
        )

    stock.delete()
    return Response(
        {"detail": "Medicine removed from pharmacy stock."},
        status=status.HTTP_200_OK,
    )


@api_view(["PUT"])
def toggle_delivery(request, pharmacy_id):
    """
    Enable or disable delivery service for a pharmacy.
    """
    try:
        pharmacy = Pharmacy.objects.get(pk=pharmacy_id)
    except Pharmacy.DoesNotExist:
        return Response(
            {"detail": "Pharmacy not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    delivery_available = request.data.get("delivery_available")
    if delivery_available is None:
        return Response(
            {"detail": "delivery_available field is required (true/false)."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if isinstance(delivery_available, str):
        delivery_available = delivery_available.lower() in ("true", "1", "yes")

    pharmacy.delivery_available = bool(delivery_available)
    pharmacy.save()

    serializer = PharmacySerializer(pharmacy)
    return Response(serializer.data, status=status.HTTP_200_OK)


# ==================== ADVANCED DASHBOARD & INTEGRATIONS ====================

@api_view(["GET"])
def pharmacy_dashboard_stats(request, pharmacy_id):
    """
    Get detailed statistics for the pharmacy dashboard.
    """
    try:
        pharmacy = Pharmacy.objects.get(pk=pharmacy_id)
    except Pharmacy.DoesNotExist:
        return Response({"detail": "Pharmacy not found."}, status=404)

    total_medicines = Stock.objects.filter(pharmacy=pharmacy).count()
    total_stock = Stock.objects.filter(pharmacy=pharmacy).aggregate(Sum('quantity'))['quantity__sum'] or 0
    
    pending_reservations = Reservation.objects.filter(pharmacy=pharmacy, status='pending').count()
    completed_reservations = Reservation.objects.filter(pharmacy=pharmacy, status='completed').count()
    
    # Categories distribution
    category_data = (
        Stock.objects.filter(pharmacy=pharmacy)
        .values('medicine__category')
        .annotate(count=Count('id'))
    )
    
    # Recent reservations
    recent_reservations = Reservation.objects.filter(pharmacy=pharmacy).order_by('-timestamp')[:5]
    res_serializer = ReservationSerializer(recent_reservations, many=True)

    from django.utils import timezone
    from datetime import timedelta
    
    thirty_days_later = timezone.now().date() + timedelta(days=30)
    ninety_days_ago = timezone.now().date() - timedelta(days=90)
    
    expiring_soon = Stock.objects.filter(
        pharmacy=pharmacy, 
        expiry_date__isnull=False, 
        expiry_date__lte=thirty_days_later
    ).count()
    
    low_stock = Stock.objects.filter(
        pharmacy=pharmacy,
        quantity__lte=F('low_stock_threshold')
    ).count()

    # Dead Stock: Added > 90 days ago OR last sold > 90 days ago
    dead_stock_query = Stock.objects.filter(pharmacy=pharmacy).filter(
        Q(last_sold_date__lte=ninety_days_ago) | Q(last_sold_date__isnull=True, added_date__lte=ninety_days_ago)
    )
    dead_stock_value = dead_stock_query.aggregate(
        val=Sum(F('quantity') * F('cost_price'))
    )['val'] or 0

    # Profit Analytics (on completed reservations)
    completed_res = Reservation.objects.filter(pharmacy=pharmacy, status='completed')
    total_revenue = completed_res.aggregate(Sum('total_amount'))['total_amount__sum'] or 0
    
    # Simple profit estimation: Revenue - (Avg Cost * Qty)
    # For simplicity, we'll use the current cost_price of the medicine in stock
    # Real-world would use historical cost, but this is a great start for a dashboard.
    total_profit = 0
    for res in completed_res:
        try:
            stock_item = Stock.objects.get(pharmacy=pharmacy, medicine=res.medicine)
            profit = res.total_amount - (stock_item.cost_price * res.quantity)
            total_profit += profit
        except Stock.DoesNotExist:
            total_profit += res.total_amount # Fallback

    # Credit Dues
    from .models import CreditCustomer
    total_credit_due = CreditCustomer.objects.filter(pharmacy=pharmacy).aggregate(Sum('total_due'))['total_due__sum'] or 0

    return Response({
        "total_medicines": total_medicines,
        "total_stock": total_stock,
        "pending_reservations": pending_reservations,
        "completed_reservations": completed_reservations,
        "expiring_soon_count": expiring_soon,
        "low_stock_count": low_stock,
        "dead_stock_value": float(dead_stock_value),
        "total_revenue": float(total_revenue),
        "total_profit": float(total_profit),
        "total_credit_due": float(total_credit_due),
        "categories": list(category_data),
        "recent_reservations": res_serializer.data,
    })


@api_view(["GET", "PUT"])
def pharmacy_integration(request, pharmacy_id):
    """
    Get or update pharmacy integration settings.
    """
    try:
        pharmacy = Pharmacy.objects.get(pk=pharmacy_id)
    except Pharmacy.DoesNotExist:
        return Response({"detail": "Pharmacy not found."}, status=404)
        
    from .models import PharmacyIntegration
    integration, _ = PharmacyIntegration.objects.get_or_create(pharmacy=pharmacy)
    
    if request.method == "GET":
        serializer = PharmacyIntegrationSerializer(integration)
        return Response(serializer.data)
        
    elif request.method == "PUT":
        serializer = PharmacyIntegrationSerializer(integration, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


@api_view(["POST"])
def sync_external_inventory(request, pharmacy_id):
    """
    Simulate syncing inventory from an external system (Apollo, Wellness, etc.).
    """
    try:
        pharmacy = Pharmacy.objects.get(pk=pharmacy_id)
        from .models import PharmacyIntegration
        integration = pharmacy.integration
        if not integration.is_active:
             return Response({"detail": "Integration is not active."}, status=400)
    except Exception:
        return Response({"detail": "Integration settings not found."}, status=404)

    # Simulation logic: Add some random dummy medicines
    dummy_data = [
        {"name": "Paracetamol 500mg", "category": "medicine", "qty": 100, "price": 40.00},
        {"name": "Vitamin C Gummies", "category": "vitamins", "qty": 50, "price": 250.00},
        {"name": "Nivea Soft Cream", "category": "skincare", "qty": 30, "price": 180.00},
        {"name": "Johnson Baby Soap", "category": "baby_care", "qty": 45, "price": 60.00},
    ]
    
    added_count = 0
    for item in dummy_data:
        medicine, _ = Medicine.objects.get_or_create(
            name=item["name"], 
            defaults={"category": item["category"], "price": item["price"]}
        )
        stock, created = Stock.objects.get_or_create(
            pharmacy=pharmacy,
            medicine=medicine,
            defaults={"quantity": item["qty"]}
        )
        if not created:
            stock.quantity += item["qty"]
            stock.save()
        added_count += 1
        
    integration.last_sync = timezone.now()
    integration.save()
    
    return Response({"detail": f"Successfully synced {added_count} items from {integration.get_system_type_display()}."})


@api_view(["PUT"])
def update_reservation_status(request, reservation_id):
    """
    Update the status of a reservation.
    """
    try:
        reservation = Reservation.objects.get(pk=reservation_id)
    except Reservation.DoesNotExist:
        return Response({"detail": "Reservation not found."}, status=404)
        
    status_val = request.data.get("status")
    if status_val not in [Reservation.STATUS_COMPLETED, Reservation.STATUS_CANCELLED, Reservation.STATUS_PENDING]:
        return Response({"detail": "Invalid status."}, status=400)
    
    reservation.status = status_val
    reservation.save()
    
    return Response({"detail": f"Reservation status updated to {status_val}."})


@api_view(["GET", "POST"])
def credit_customers(request, pharmacy_id):
    try:
        pharmacy = Pharmacy.objects.get(pk=pharmacy_id)
    except Pharmacy.DoesNotExist:
        return Response({"detail": "Pharmacy not found."}, status=404)

    if request.method == "GET":
        customers = CreditCustomer.objects.filter(pharmacy=pharmacy)
        serializer = CreditCustomerSerializer(customers, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        serializer = CreditCustomerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(pharmacy=pharmacy)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "POST"])
def prescriptions(request, pharmacy_id):
    try:
        pharmacy = Pharmacy.objects.get(pk=pharmacy_id)
    except Pharmacy.DoesNotExist:
        return Response({"detail": "Pharmacy not found."}, status=404)

    if request.method == "GET":
        prescs = Prescription.objects.filter(pharmacy=pharmacy).order_by("-uploaded_at")
        serializer = PrescriptionSerializer(prescs, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        serializer = PrescriptionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(pharmacy=pharmacy)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def medicine_alternatives(request, medicine_id):
    """
    Suggest alternatives for a medicine.
    """
    try:
        medicine = Medicine.objects.get(pk=medicine_id)
    except Medicine.DoesNotExist:
        return Response({"detail": "Medicine not found."}, status=404)

    alternatives = MedicineAlternative.objects.filter(medicine=medicine)
    # Return suggested medicines directly
    suggested_meds = [alt.alternative for alt in alternatives]
    serializer = MedicineSerializer(suggested_meds, many=True)
    return Response(serializer.data)

@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def create_payment_intent(request):
    """
    Creates a Stripe PaymentIntent for the current cart.
    - amount: in INR (e.g. 500.50)
    """
    try:
        data = request.data
        total_amount = data.get('amount')
        
        if not total_amount:
            return Response({'error': 'Amount is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Stripe minimum for INR is ~40.00 Rupees
        # Convert total_amount to paise (multiply by 100)
        amount_in_paise = int(Decimal(str(total_amount)) * 100)
        
        intent = stripe.PaymentIntent.create(
            amount=amount_in_paise,
            currency=settings.STRIPE_CURRENCY,
            metadata={'user_id': request.user.id},
            automatic_payment_methods={
                'enabled': True,
            },
        )
        
        return Response({
            'clientSecret': intent.client_secret,
            'publishableKey': settings.STRIPE_PUBLISHABLE_KEY
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
