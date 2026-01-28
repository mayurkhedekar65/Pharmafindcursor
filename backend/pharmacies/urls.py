from django.urls import path

from . import views

urlpatterns = [
    # Consumer-side APIs
    path("medicine-search/", views.medicine_search, name="medicine-search"),
    path("reservations/", views.create_reservation, name="create-reservation"),

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
]

