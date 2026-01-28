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
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)

    def __str__(self) -> str:
        return self.name


class Stock(models.Model):
    pharmacy = models.ForeignKey(Pharmacy, on_delete=models.CASCADE, related_name="stocks")
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE, related_name="stocks")
    quantity = models.PositiveIntegerField()

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

    pharmacy = models.ForeignKey(Pharmacy, on_delete=models.CASCADE, related_name="reservations")
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE, related_name="reservations")
    quantity = models.PositiveIntegerField()
    mode = models.CharField(max_length=20, choices=MODE_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)
    user_identifier = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self) -> str:
        return f"Reservation {self.id} - {self.pharmacy} - {self.medicine}"


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
