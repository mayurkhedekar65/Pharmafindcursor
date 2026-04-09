from django.db import models
from django.contrib.auth.models import User


class Pharmacy(models.Model):
    name = models.CharField(max_length=255)
    area = models.CharField(max_length=255)
    city = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()
    delivery_available = models.BooleanField(default=False)
    contact = models.CharField(max_length=255, blank=True)

    def __str__(self) -> str:
        return f"{self.name} ({self.area}, {self.city})"


class Medicine(models.Model):
    CATEGORY_CHOICES = [
        ("medicine", "Core Medicine"),
        ("skincare", "Skincare"),
        ("personal_care", "Personal Care"),
        ("baby_care", "Baby care"),
        ("vitamins", "Vitamins & Supplements"),
        ("healthcare_devices", "Home Healthcare Devices"),
    ]
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default="medicine")
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self) -> str:
        return f"{self.name} ({self.get_category_display()})"


class Stock(models.Model):
    pharmacy = models.ForeignKey(Pharmacy, on_delete=models.CASCADE, related_name="stocks", db_index=True)
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE, related_name="stocks", db_index=True)
    quantity = models.PositiveIntegerField()
    batch_number = models.CharField(max_length=50, blank=True, null=True)
    expiry_date = models.DateField(blank=True, null=True)
    low_stock_threshold = models.PositiveIntegerField(default=10)
    
    # Financial Intelligence
    selling_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Dead Stock Tracking
    last_sold_date = models.DateField(null=True, blank=True)
    added_date = models.DateField(null=True, blank=True)

    class Meta:
        unique_together = ("pharmacy", "medicine")

    def __str__(self) -> str:
        return f"{self.pharmacy} - {self.medicine} ({self.quantity})"


class Reservation(models.Model):
    MODE_PICKUP = "pickup"
    MODE_DELIVERY = "delivery"

    MODE_CHOICES = [
        (MODE_PICKUP, "Pickup"),
        (MODE_DELIVERY, "Delivery"),
    ]

    STATUS_PENDING = "pending"
    STATUS_ACCEPTED = "accepted"
    STATUS_READY = "ready"
    STATUS_OUT_FOR_DELIVERY = "out_for_delivery"
    STATUS_COMPLETED = "completed"
    STATUS_CANCELLED = "cancelled"

    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_ACCEPTED, "Accepted"),
        (STATUS_READY, "Ready for Pickup"),
        (STATUS_OUT_FOR_DELIVERY, "Out for Delivery"),
        (STATUS_COMPLETED, "Completed"),
        (STATUS_CANCELLED, "Cancelled"),
    ]

    pharmacy = models.ForeignKey(Pharmacy, on_delete=models.CASCADE, related_name="reservations", db_index=True)
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE, related_name="reservations")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reservations", null=True, blank=True, db_index=True)
    quantity = models.PositiveIntegerField()
    mode = models.CharField(max_length=20, choices=MODE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING, db_index=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    user_identifier = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self) -> str:
        return f"Reservation {self.id} - {self.pharmacy} - {self.medicine} ({self.status})"


class CreditCustomer(models.Model):
    pharmacy = models.ForeignKey(Pharmacy, on_delete=models.CASCADE, related_name="credit_customers")
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    total_due = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    last_payment_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.name} - Due: ₹{self.total_due}"


class Prescription(models.Model):
    pharmacy = models.ForeignKey(Pharmacy, on_delete=models.CASCADE, related_name="prescriptions")
    patient_name = models.CharField(max_length=255)
    patient_phone = models.CharField(max_length=20, blank=True)
    image = models.ImageField(upload_to='prescriptions/', null=True, blank=True)
    extracted_text = models.TextField(blank=True, help_text="AI OCR Extracted text")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Prescription: {self.patient_name} ({self.uploaded_at.date()})"


class MedicineAlternative(models.Model):
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE, related_name="alternatives_main")
    alternative = models.ForeignKey(Medicine, on_delete=models.CASCADE, related_name="alternatives_suggested")
    reason = models.CharField(max_length=255, default="Same salt/composition")

    class Meta:
        unique_together = ("medicine", "alternative")


class PharmacyIntegration(models.Model):
    SYSTEM_GENERIC = "generic"
    SYSTEM_MULTILOC = "multiloc"
    SYSTEM_CUSTOM = "custom"

    SYSTEM_CHOICES = [
        (SYSTEM_GENERIC, "Standard ERP (Local)"),
        (SYSTEM_MULTILOC, "Cloud Multi-location System"),
        (SYSTEM_CUSTOM, "Custom REST API Integration"),
    ]

    pharmacy = models.OneToOneField(Pharmacy, on_delete=models.CASCADE, related_name="integration")
    system_type = models.CharField(max_length=20, choices=SYSTEM_CHOICES)
    api_key = models.CharField(max_length=255, blank=True)
    api_url = models.URLField(blank=True)
    is_active = models.BooleanField(default=False)
    last_sync = models.DateTimeField(null=True, blank=True)

    def __str__(self) -> str:
        return f"Integration: {self.pharmacy.name} ({self.system_type})"


class UserProfile(models.Model):
    ROLE_CONSUMER = "consumer"
    ROLE_PHARMACY = "pharmacy"

    ROLE_CHOICES = [
        (ROLE_CONSUMER, "Consumer"),
        (ROLE_PHARMACY, "Pharmacy"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    pharmacy = models.OneToOneField(
        Pharmacy,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="account",
        help_text="Linked pharmacy for pharmacy accounts.",
    )

    def __str__(self) -> str:
        return f"{self.user.username} ({self.role})"
