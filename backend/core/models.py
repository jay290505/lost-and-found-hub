from django.db import models
from django.conf import settings
import uuid


class Item(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True)
    department = models.CharField(max_length=200, blank=True)
    location = models.CharField(max_length=200, blank=True)
    # allow storing data URLs or arbitrary image references in dev
    imageUrl = models.TextField(blank=True)
    # optional owner linking to Django user
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    found = models.BooleanField(default=False)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Claim(models.Model):
    """A claim that a user makes on an Item declaring ownership.

    The system issues a unique token for each claim which can be used to
    verify the claim later (for example, by embedding the token in a PDF or
    sending it to a claimant). Staff users can approve or reject claims.
    """
    STATUS_PENDING = 'pending'
    STATUS_APPROVED = 'approved'
    STATUS_REJECTED = 'rejected'

    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_APPROVED, 'Approved'),
        (STATUS_REJECTED, 'Rejected'),
    ]

    item = models.ForeignKey(Item, related_name='claims', on_delete=models.CASCADE)
    claimant = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='claims', on_delete=models.CASCADE)
    evidence_text = models.TextField(blank=True)
    evidence_url = models.TextField(blank=True)
    claimant_phone = models.CharField(max_length=32, blank=True)
    claimant_email = models.CharField(max_length=254, blank=True)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default=STATUS_PENDING)
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    verified_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Claim #{self.pk} on {self.item} by {self.claimant} ({self.status})"


class ClaimResponse(models.Model):
    """Stores answers submitted when someone verifies a claim via the public verify page.

    Fields:
    - claim: FK to Claim
    - responder_name: optional name provided by the person verifying
    - answers: JSON/text blob of provided answers
    - ip_address: recorded for audit (optional)
    - created_at: timestamp
    """
    claim = models.ForeignKey(Claim, related_name='responses', on_delete=models.CASCADE)
    responder_name = models.CharField(max_length=200, blank=True)
    answers = models.JSONField(default=dict, blank=True)
    ip_address = models.CharField(max_length=45, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Response for claim {self.claim_id} by {self.responder_name or 'anonymous'}"
