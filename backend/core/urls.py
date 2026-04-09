from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.health, name='health'),
    path('ping/', views.ping, name='ping'),
    path('items/', views.items_list, name='items_list'),
    path('items/<int:item_id>/', views.item_detail, name='item_detail'),
    path('my-items/', views.my_items, name='my_items'),
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('profile/', views.profile_view, name='profile'),
    path('logout/', views.logout_view, name='logout'),
    path('items/stats/', views.items_stats, name='items_stats'),
    path('rewards/certificate/', views.certificate_view, name='certificate'),
    path('claims/', views.create_claim, name='create_claim'),
    path('claims/my/', views.my_claims, name='my_claims'),
    path('claims/<int:claim_id>/', views.claim_detail, name='claim_detail'),
    path('claims/verify/<str:token>/', views.verify_claim, name='verify_claim'),
]
