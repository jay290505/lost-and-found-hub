from rest_framework import serializers
from .models import Item
from .models import Claim
from .models import ClaimResponse


class ItemSerializer(serializers.ModelSerializer):
    owner_username = serializers.SerializerMethodField()
    claims = serializers.SerializerMethodField()

    class Meta:
        model = Item
        fields = ['id', 'title', 'description', 'category', 'department', 'location', 'imageUrl', 'found', 'date', 'owner', 'owner_username', 'claims']
        read_only_fields = ['owner', 'owner_username']

    def get_owner_username(self, obj):
        return obj.owner.username if obj.owner else None

    def get_claims(self, obj):
        # return a lightweight list of claims for this item
        claims = obj.claims.all().order_by('-created_at')[:5]
        return [
            {
                'id': c.id,
                'claimant_username': c.claimant.username if c.claimant else None,
                'status': c.status,
                'created_at': c.created_at,
                'token': str(c.token),
            }
            for c in claims
        ]


class ClaimSerializer(serializers.ModelSerializer):
    claimant_username = serializers.SerializerMethodField()
    item_title = serializers.SerializerMethodField()

    class Meta:
        model = Claim
        fields = ['id', 'item', 'item_title', 'claimant', 'claimant_username', 'evidence_text', 'evidence_url', 'claimant_phone', 'claimant_email', 'status', 'token', 'created_at', 'updated_at', 'verified_at']
        read_only_fields = ['status', 'token', 'created_at', 'updated_at', 'verified_at']

    def get_claimant_username(self, obj):
        return obj.claimant.username if obj.claimant else None

    def get_item_title(self, obj):
        return obj.item.title if obj.item else None


class ClaimResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClaimResponse
        fields = ['id', 'claim', 'responder_name', 'answers', 'ip_address', 'created_at']
        read_only_fields = ['id', 'created_at']
