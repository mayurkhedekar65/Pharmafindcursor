from rest_framework import serializers
from django.contrib.auth.models import User

from .models import Medicine, Pharmacy, Reservation, Stock, UserProfile


class PharmacySerializer(serializers.ModelSerializer):
    class Meta:
        model = Pharmacy
        fields = [
            "id",
            "name",
            "area",
            "city",
            "latitude",
            "longitude",
            "delivery_available",
            "contact",
        ]


class MedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicine
        fields = ["id", "name", "description"]


class StockSerializer(serializers.ModelSerializer):
    pharmacy = PharmacySerializer(read_only=True)
    medicine = MedicineSerializer(read_only=True)

    class Meta:
        model = Stock
        fields = ["id", "pharmacy", "medicine", "quantity"]


class ReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = [
            "id",
            "pharmacy",
            "medicine",
            "quantity",
            "mode",
            "timestamp",
            "user_identifier",
        ]
        read_only_fields = ["id", "timestamp"]


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
        fields = ["pharmacy", "medicine", "quantity"]


class StockListSerializer(serializers.ModelSerializer):
    """Serializer for listing stock with medicine details."""
    medicine = MedicineSerializer(read_only=True)
    pharmacy_name = serializers.CharField(source="pharmacy.name", read_only=True)

    class Meta:
        model = Stock
        fields = ["id", "medicine", "pharmacy_name", "quantity"]


class UserSignupSerializer(serializers.Serializer):
    """Signup for a regular consumer user."""

    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=False, allow_blank=True)

    def validate_username(self, value: str) -> str:
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username is already taken.")
        return value


class PharmacySignupSerializer(serializers.Serializer):
    """Signup for a pharmacy account (creates user + pharmacy)."""

    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
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


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

