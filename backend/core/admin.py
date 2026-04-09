from django.contrib import admin
from .models import Item
from .models import Claim
from .models import ClaimResponse


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'department', 'location', 'found', 'date')
    list_filter = ('found', 'department', 'category')
    search_fields = ('title', 'description', 'location')


@admin.register(Claim)
class ClaimAdmin(admin.ModelAdmin):
    list_display = ('id', 'item', 'claimant', 'claimant_phone', 'claimant_email', 'status', 'token', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('claimant__username', 'item__title', 'token')


@admin.register(ClaimResponse)
class ClaimResponseAdmin(admin.ModelAdmin):
    list_display = ('id', 'claim', 'responder_name', 'ip_address', 'created_at')
    search_fields = ('responder_name', 'claim__token')
    readonly_fields = ('answers',)
