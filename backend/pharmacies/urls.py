from django.urls import path

from . import views

urlpatterns = [
    # Consumer-side APIs
    path("medicine-search/", views.medicine_search, name="medicine-search"),
    path("reservations/", views.create_reservation, name="create-reservation"),
    path("user-orders/", views.user_reservations, name="user-orders"),

    # Auth APIs
    path("auth/user/signup/", views.user_signup, name="user-signup"),
    path("auth/pharmacy/signup/", views.pharmacy_signup, name="pharmacy-signup"),
    path("auth/login/", views.login_view, name="login"),
    
    # Helper APIs
    path("pharmacies/", views.list_pharmacies, name="list-pharmacies"),
    path("medicines/", views.list_medicines, name="list-medicines"),
    
    # Pharmacy portal APIs
    path("pharmacy/<int:pharmacy_id>/profile/", views.pharmacy_profile, name="pharmacy-profile"),
    path("pharmacy/<int:pharmacy_id>/stock/", views.pharmacy_stock_list, name="pharmacy-stock-list"),
    path("pharmacy/<int:pharmacy_id>/stock/add/", views.add_medicine_to_pharmacy, name="add-medicine-to-pharmacy"),
    path("pharmacy/<int:pharmacy_id>/stock/<int:stock_id>/", views.update_stock_quantity, name="update-stock-quantity"),
    path("pharmacy/<int:pharmacy_id>/stock/<int:stock_id>/delete/", views.remove_medicine_from_pharmacy, name="remove-medicine-from-pharmacy"),
    path("pharmacy/<int:pharmacy_id>/delivery-toggle/", views.toggle_delivery, name="toggle-delivery"),
    path("pharmacy/<int:pharmacy_id>/orders/", views.pharmacy_orders, name="pharmacy-orders"),
    
    # Advanced Dashboard & Integrations
    path("pharmacy/<int:pharmacy_id>/stats/", views.pharmacy_dashboard_stats, name="pharmacy-dashboard-stats"),
    path("pharmacy/<int:pharmacy_id>/integration/", views.pharmacy_integration, name="pharmacy-integration"),
    path("pharmacy/<int:pharmacy_id>/sync/", views.sync_external_inventory, name="sync-inventory"),
    path("reservations/<int:reservation_id>/status/", views.update_reservation_status, name="update-reservation-status"),
    
    # Financial & Compliance
    path("pharmacy/<int:pharmacy_id>/credit-customers/", views.credit_customers, name="credit-customers"),
    path("pharmacy/<int:pharmacy_id>/prescriptions/", views.prescriptions, name="prescriptions"),
    path("medicine/<int:medicine_id>/alternatives/", views.medicine_alternatives, name="medicine-alternatives"),
    
    # Stripe Payments
    path("payments/create-payment-intent/", views.create_payment_intent, name="create-payment-intent"),
]

