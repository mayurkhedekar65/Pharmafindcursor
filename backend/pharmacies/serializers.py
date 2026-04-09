from rest_framework import serializers
from django.contrib.auth.models import User

from .models import (
    Medicine, Pharmacy, Reservation, Stock, UserProfile, 
    PharmacyIntegration, CreditCustomer, Prescription, MedicineAlternative
)


class PharmacySerializer(serializers.ModelSerializer):
    class Meta:
        model = Pharmacy
        fields = [
            "id", "name", "area", "city", "latitude", "longitude", 
            "delivery_available", "contact",
        ]


class MedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicine
        fields = ["id", "name", "description", "category", "price"]


class StockSerializer(serializers.ModelSerializer):
    pharmacy = PharmacySerializer(read_only=True)
    medicine = MedicineSerializer(read_only=True)

    class Meta:
        model = Stock
        fields = [
            "id", "pharmacy", "medicine", "quantity", "batch_number", 
            "expiry_date", "low_stock_threshold", "selling_price", 
            "cost_price", "last_sold_date", "added_date"
        ]


class ReservationSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(source="medicine.name", read_only=True)
    pharmacy_name = serializers.CharField(source="pharmacy.name", read_only=True)
    customer_name = serializers.CharField(source="user.username", read_only=True)
    
    class Meta:
        model = Reservation
        fields = [
            "id", "user", "customer_name", "pharmacy", "pharmacy_name", 
            "medicine", "medicine_name", "quantity", "mode", "status", 
            "total_amount", "timestamp", "user_identifier",
        ]
        read_only_fields = ["id", "timestamp"]


class CreditCustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreditCustomer
        fields = ["id", "pharmacy", "name", "phone", "total_due", "last_payment_date", "notes"]


class PrescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prescription
        fields = ["id", "pharmacy", "patient_name", "patient_phone", "image", "extracted_text", "uploaded_at"]
        read_only_fields = ["uploaded_at"]


class PharmacyIntegrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PharmacyIntegration
        fields = ["id", "system_type", "api_key", "api_url", "is_active", "last_sync"]
        read_only_fields = ["last_sync"]


class MedicineSearchInputSerializer(serializers.Serializer):
    user_location = serializers.CharField()
    medicine_name = serializers.CharField()


class MedicineSearchResultSerializer(serializers.Serializer):
    pharmacy_name = serializers.CharField()
    area = serializers.CharField()
    city = serializers.CharField()
    distance_km = serializers.FloatField()
    medicine_name = serializers.CharField()
    quantity = serializers.IntegerField()
    delivery_available = serializers.BooleanField()
    category = serializers.CharField()
    price = serializers.DecimalField(max_digits=10, decimal_places=2)


class PharmacyUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating pharmacy profile."""
    class Meta:
        model = Pharmacy
        fields = [
            "name",
            "area",
            "city",
            "latitude",
            "longitude",
            "delivery_available",
            "contact",
        ]


class StockCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating or updating stock."""
    class Meta:
        model = Stock
        fields = [
            "pharmacy", "medicine", "quantity", "batch_number", 
            "expiry_date", "low_stock_threshold", "selling_price", "cost_price"
        ]


class StockListSerializer(serializers.ModelSerializer):
    """Serializer for listing stock with medicine details."""
    medicine = MedicineSerializer(read_only=True)
    pharmacy_name = serializers.CharField(source="pharmacy.name", read_only=True)

    class Meta:
        model = Stock
        fields = [
            "id", "medicine", "pharmacy_name", "quantity", "batch_number", 
            "expiry_date", "low_stock_threshold", "selling_price", "cost_price"
        ]


class UserSignupSerializer(serializers.Serializer):
    """Signup for a regular consumer user."""

    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=False, allow_blank=True)

    def validate_username(self, value: str) -> str:
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username is already taken.")
        return value

    def validate(self, data):
        if data.get("password") != data.get("confirm_password"):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return data


class PharmacySignupSerializer(serializers.Serializer):
    """Signup for a pharmacy account (creates user + pharmacy)."""

    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=False, allow_blank=True)

    pharmacy_name = serializers.CharField()
    area = serializers.CharField()
    city = serializers.CharField()
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()
    contact = serializers.CharField(required=False, allow_blank=True)
    delivery_available = serializers.BooleanField(default=False)

    def validate_username(self, value: str) -> str:
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username is already taken.")
        return value

    def validate(self, data):
        if data.get("password") != data.get("confirm_password"):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return data


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

