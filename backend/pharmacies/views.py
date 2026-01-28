from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

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
            if distance is None:
                continue
            results.append(
                {
                    "pharmacy_name": stock.pharmacy.name,
                    "area": stock.pharmacy.area,
                    "city": stock.pharmacy.city,
                    "distance_km": round(float(distance), 2),
                    "medicine_name": stock.medicine.name,
                    "quantity": stock.quantity,
                    "delivery_available": stock.pharmacy.delivery_available,
                }
            )

        results.sort(key=lambda item: item["distance_km"])
        output_serializer = MedicineSearchResultSerializer(results, many=True)
        return Response(
            {
                "resolved_location": resolved_area,
                "results": output_serializer.data,
            },
            status=status.HTTP_200_OK,
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

    This is a conceptual endpoint and does not perform payment or
    external integrations.
    """
    serializer = ReservationSerializer(data=request.data)
    if serializer.is_valid():
        reservation = serializer.save()
        output_serializer = ReservationSerializer(reservation)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
        token, _ = Token.objects.get_or_create(user=user)
    except Exception:
        return Response(
            {"detail": "Account creation failed. Please try again."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return Response(
        {
            "token": token.key,
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
        token, _ = Token.objects.get_or_create(user=user)
    except Exception:
        return Response(
            {"detail": "Account creation failed. Please try again."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return Response(
        {
            "token": token.key,
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

    token, _ = Token.objects.get_or_create(user=user)

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
            "token": token.key,
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

    # Get or create medicine
    medicine, _ = Medicine.objects.get_or_create(
        name=medicine_name,
        defaults={"description": medicine_description},
    )

    # Get or create stock
    stock, created = Stock.objects.get_or_create(
        pharmacy=pharmacy,
        medicine=medicine,
        defaults={"quantity": quantity},
    )

    if not created:
        # Update existing stock
        stock.quantity = quantity
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
