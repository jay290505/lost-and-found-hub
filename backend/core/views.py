from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate, login as django_login
from django.contrib.auth import get_user_model
from .models import Item, Claim
from .serializers import ItemSerializer
from .serializers import ClaimSerializer
from django.conf import settings
from django.contrib.auth import logout as django_logout
from django.db.models import Q, Count
import io
from django.http import HttpResponse


@api_view(['GET'])
def certificate_view(request):
    """Generate a simple certificate PDF for the authenticated user (dev: allow ?collegeId= when DEBUG).

    Returns: application/pdf attachment
    """
    # Determine user
    User = get_user_model()
    user = None
    if request.user and request.user.is_authenticated:
        user = request.user
    else:
        # dev fallback
        if settings.DEBUG:
            col = request.GET.get('collegeId')
            if col:
                user = User.objects.filter(username=col).first()

    if not user:
        return Response({'detail': 'auth required'}, status=status.HTTP_401_UNAUTHORIZED)

    # compute items found count for user
    try:
        found_count = Item.objects.filter(owner=user, found=True).count()
    except Exception:
        found_count = 0

    # Basic badge thresholds (keep in sync with frontend MOCK_BADGES)
    badge_name = None
    badge_desc = ''
    if found_count >= 10:
        badge_name = 'Gold Helper'
        badge_desc = '10 items! Your efforts make our campus better.'
    elif found_count >= 5:
        badge_name = 'Silver Helper'
        badge_desc = '5 items recovered! You\'re a campus hero.'
    elif found_count >= 3:
        badge_name = 'Bronze Helper'
        badge_desc = 'You\'ve helped recover 3 items. A great start!'
    else:
        badge_name = 'Helper'
        badge_desc = 'Thanks for helping out.'

    # generate PDF (reportlab)
    try:
        from reportlab.lib.pagesizes import landscape, A4
        from reportlab.pdfgen import canvas
        from reportlab.lib.units import mm
        from reportlab.lib import colors
    except Exception as e:
        return Response({'detail': 'server missing dependency', 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    buffer = io.BytesIO()
    # A4 landscape
    width, height = landscape(A4)
    c = canvas.Canvas(buffer, pagesize=(width, height))

    # Outer border
    margin = 36
    c.setLineWidth(3)
    c.setStrokeColor(colors.HexColor('#0f172a'))
    c.roundRect(margin, margin, width - margin * 2, height - margin * 2, radius=18, stroke=1, fill=0)

    # Title
    c.setFillColor(colors.HexColor('#0b5cff'))
    c.setFont('Helvetica-Bold', 34)
    c.drawCentredString(width / 2, height - 88, 'Certificate of Appreciation')

    # Subtitle and recipient
    c.setFont('Helvetica', 14)
    c.setFillColor(colors.black)
    c.drawCentredString(width / 2, height - 130, 'This certificate is proudly presented to')

    # allow client to pass an explicit name (dev/fallback) so server PDF matches preview
    explicit_name = request.GET.get('name') or request.GET.get('recipient')
    if explicit_name:
        recipient = explicit_name
    else:
        recipient = (user.first_name or '') + ((' ' + user.last_name) if getattr(user, 'last_name', '') else '')
        recipient = recipient.strip() or user.username
    c.setFont('Helvetica-Bold', 36)
    c.setFillColor(colors.HexColor('#0b2a66'))
    c.drawCentredString(width / 2, height - 180, recipient)

    # Achievement line
    c.setFont('Helvetica', 16)
    c.setFillColor(colors.black)
    achievement = f'For outstanding contribution — {found_count} item(s) reported/found'
    c.drawCentredString(width / 2, height - 220, achievement)

    # Badge name and description box
    c.setFont('Helvetica-Bold', 20)
    c.setFillColor(colors.HexColor('#9b3412'))
    c.drawCentredString(width / 2, height - 260, badge_name)
    c.setFont('Helvetica-Oblique', 12)
    c.setFillColor(colors.black)
    c.drawCentredString(width / 2, height - 286, badge_desc)

    # Decorative seal (circle) on left bottom
    seal_x = margin + 80
    seal_y = margin + 120
    c.setFillColor(colors.HexColor('#fde68a'))
    c.circle(seal_x, seal_y, 44, stroke=1, fill=1)
    c.setFillColor(colors.HexColor('#b45309'))
    c.setFont('Helvetica-Bold', 20)
    c.drawCentredString(seal_x, seal_y - 6, 'LF')

    # Signature area on right bottom
    sig_x = width - margin - 260
    sig_y = margin + 110
    c.setStrokeColor(colors.black)
    c.setLineWidth(1)
    c.line(sig_x, sig_y + 36, sig_x + 200, sig_y + 36)
    c.setFont('Helvetica', 10)
    c.drawCentredString(sig_x + 100, sig_y + 18, 'Authorized Signature')

    # Date
    import datetime
    c.setFont('Helvetica', 10)
    c.drawString(margin + 20, margin + 24, f'Date: {datetime.date.today().isoformat()}')

    c.showPage()
    c.save()
    buffer.seek(0)

    filename = f'certificate-{recipient.replace(" ", "_")}-{badge_name.replace(" ", "_")}.pdf'
    response = HttpResponse(buffer.read(), content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response



@api_view(['GET'])
def health(request):
    return Response({'status': 'ok'})


@api_view(['GET'])
def ping(request):
    """Simple ping endpoint used by the frontend during development to verify connectivity."""
    return Response({'ping': 'pong', 'ok': True})


@api_view(['POST'])
def create_claim(request):
    """Create a claim for an item. Requires authentication (dev: allow owner_college in DEBUG)."""
    if not request.user or not request.user.is_authenticated:
        # in DEBUG allow claimant via payload
        if not settings.DEBUG:
            return Response({'detail': 'auth required'}, status=status.HTTP_401_UNAUTHORIZED)

    item_id = request.data.get('item') or request.data.get('item_id')
    evidence_text = request.data.get('evidence_text', '')
    evidence_url = request.data.get('evidence_url', '')
    claimant_phone = request.data.get('claimant_phone', '')
    claimant_email = request.data.get('claimant_email', '')

    if not item_id:
        return Response({'detail': 'missing item id'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        item = Item.objects.get(pk=int(item_id))
    except Exception:
        return Response({'detail': 'item not found'}, status=status.HTTP_404_NOT_FOUND)

    claimant = request.user
    if not claimant or not claimant.is_authenticated:
        # dev fallback: allow claimant by username
        claimant_username = request.data.get('claimant_username') or request.data.get('owner_collegeId')
        if claimant_username and settings.DEBUG:
            User = get_user_model()
            claimant = User.objects.filter(username=claimant_username).first()
    if not claimant:
        return Response({'detail': 'claimant not available'}, status=status.HTTP_400_BAD_REQUEST)

    claim = None
    try:
        claim = Claim.objects.create(item=item, claimant=claimant, evidence_text=evidence_text, evidence_url=evidence_url, claimant_phone=claimant_phone or '', claimant_email=claimant_email or '')
    except Exception as e:
        return Response({'detail': 'could not create claim', 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    serializer = ClaimSerializer(claim)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def my_claims(request):
    if not request.user or not request.user.is_authenticated:
        return Response({'detail': 'auth required'}, status=status.HTTP_401_UNAUTHORIZED)
    qs = Claim.objects.filter(claimant=request.user).order_by('-created_at')
    serializer = ClaimSerializer(qs, many=True)
    return Response(serializer.data)


@api_view(['GET', 'PATCH'])
def claim_detail(request, claim_id):
    """Retrieve or update a claim. PATCH can be used by staff to approve/reject."""
    try:
        claim = Claim.objects.get(pk=claim_id)
    except Claim.DoesNotExist:
        return Response({'detail': 'not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ClaimSerializer(claim)
        return Response(serializer.data)

    if request.method == 'PATCH':
        # Only staff can change status in this dev app
        if not (request.user and request.user.is_authenticated and request.user.is_staff):
            return Response({'detail': 'forbidden'}, status=status.HTTP_403_FORBIDDEN)

        status_val = request.data.get('status')
        if status_val in [Claim.STATUS_APPROVED, Claim.STATUS_REJECTED]:
            claim.status = status_val
            if status_val == Claim.STATUS_APPROVED:
                from django.utils import timezone
                claim.verified_at = timezone.now()
            claim.save()
        serializer = ClaimSerializer(claim)
        return Response(serializer.data)


@api_view(['GET', 'POST'])
def verify_claim(request, token):
    """Verify a claim by token.

    - GET: return JSON about the claim
    - POST: accept verification answers payload and store a ClaimResponse record
    """
    try:
        import uuid as _uuid
        token_uuid = _uuid.UUID(token)
    except Exception:
        return Response({'detail': 'invalid token'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        claim = Claim.objects.filter(token=token_uuid).first()
    except Exception:
        claim = None

    if not claim:
        return Response({'valid': False, 'detail': 'not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response({'valid': True, 'status': claim.status, 'item': claim.item.id, 'claimant': claim.claimant.username if claim.claimant else None})

    # POST - store verification answers
    try:
        responder_name = request.data.get('responder_name', '')
        answers = request.data.get('answers', {})
        # record IP if available
        ip = request.META.get('REMOTE_ADDR', '')
        # import local model here to avoid circular issues
        from .models import ClaimResponse
        cr = ClaimResponse.objects.create(claim=claim, responder_name=responder_name or '', answers=answers or {}, ip_address=ip)
        from .serializers import ClaimResponseSerializer
        serializer = ClaimResponseSerializer(cr)
        return Response({'ok': True, 'response': serializer.data}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'detail': 'could not save response', 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'POST'])
def items_list(request):
    # Allow creating items via POST and listing via GET
    if request.method == 'POST':
        title = request.data.get('title') or request.data.get('name')
        description = request.data.get('description', '')
        department = request.data.get('department', '')
        location = request.data.get('location', '')
        category = request.data.get('category', '')
        imageUrl = request.data.get('imageUrl', '')

        # Accept http/https URLs or data URLs (base64) in dev
        if imageUrl and not (imageUrl.startswith('http://') or imageUrl.startswith('https://') or imageUrl.startswith('data:')):
            imageUrl = ''

        item_kwargs = dict(
            title=title or 'Untitled',
            description=description,
            category=category,
            department=department,
            location=location,
            imageUrl=imageUrl,
        )

        # Persist 'found' status if provided (expect boolean)
        if 'found' in request.data:
            try:
                item_kwargs['found'] = bool(request.data.get('found'))
            except Exception:
                pass

        # set owner if authenticated
        if request.user and request.user.is_authenticated:
            item_kwargs['owner'] = request.user
        else:
            # Dev helper: allow assigning owner by collegeId when DEBUG is True and no session is present
            try:
                if settings.DEBUG:
                    owner_college = request.data.get('owner_collegeId') or request.data.get('owner')
                    if owner_college:
                        User = get_user_model()
                        try:
                            owner_user = User.objects.filter(username=owner_college).first()
                            if owner_user:
                                item_kwargs['owner'] = owner_user
                        except Exception:
                            pass
            except Exception:
                pass

        item = Item.objects.create(**item_kwargs)
        serializer = ItemSerializer(item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    # Default: GET - list items ordered by newest first
    if request.method == 'GET':
        items = Item.objects.all().order_by('-date')
        serializer = ItemSerializer(items, many=True)
        return Response(serializer.data)


@api_view(['GET', 'PATCH', 'DELETE'])
def item_detail(request, item_id):
    """Retrieve, update, or delete a single item by ID."""
    try:
        item = Item.objects.get(pk=item_id)
    except Item.DoesNotExist:
        return Response({'detail': 'not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ItemSerializer(item)
        return Response(serializer.data)

    if request.method == 'PATCH':
        # Only allow a small set of fields to be updated via this endpoint in dev
        changed = False
        if 'found' in request.data:
            try:
                item.found = bool(request.data.get('found'))
                changed = True
            except Exception:
                pass

        # Allow updating owner by username (dev convenience)
        if 'owner_username' in request.data:
            owner_username = request.data.get('owner_username')
            if owner_username:
                try:
                    User = get_user_model()
                    owner_user = User.objects.filter(username=owner_username).first()
                    if owner_user:
                        item.owner = owner_user
                        changed = True
                except Exception:
                    pass

        if changed:
            item.save()

        serializer = ItemSerializer(item)
        return Response(serializer.data)

    if request.method == 'DELETE':
        item.delete()
        return Response({'detail': 'deleted'})



@api_view(['GET'])
def my_items(request):
    if not request.user or not request.user.is_authenticated:
        return Response({'detail': 'auth required'}, status=status.HTTP_401_UNAUTHORIZED)
    items = Item.objects.filter(owner=request.user).order_by('-date')
    serializer = ItemSerializer(items, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(request, username=username, password=password)
    if user is not None:
        # create a session cookie
        django_login(request, user)
        # mark user as staff in dev so they can access admin
        try:
            if settings.DEBUG and not user.is_staff:
                user.is_staff = True
                user.save()
        except Exception:
            pass
        # return basic profile info to frontend
        return Response({'detail': 'ok', 'name': user.first_name or '', 'collegeId': user.username})
    return Response({'detail': 'invalid'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
def google_login(request):
    # This endpoint was removed. Keep a placeholder to avoid import errors if referenced elsewhere.
    return Response({'detail': 'google login disabled'}, status=status.HTTP_410_GONE)


@api_view(['POST'])
def register_view(request):
    """Create a new user for dev/demo. Expects JSON: {name, collegeId, password}"""
    name = request.data.get('name')
    collegeId = request.data.get('collegeId')
    password = request.data.get('password')
    if not (name and collegeId and password):
        return Response({'detail': 'missing fields'}, status=status.HTTP_400_BAD_REQUEST)
    from django.contrib.auth import get_user_model
    User = get_user_model()
    if User.objects.filter(username=collegeId).exists():
        return Response({'detail': 'exists'}, status=status.HTTP_400_BAD_REQUEST)
    user = User.objects.create_user(username=collegeId, password=password, first_name=name)
    # auto-login after register
    django_login(request, user)
    return Response({'name': user.first_name, 'collegeId': user.username})



@api_view(['GET', 'PUT'])
def profile_view(request):
    """GET returns profile; PUT updates profile fields (first_name, email, password).
    Requires session authentication (login)."""
    if not request.user or not request.user.is_authenticated:
        return Response({'detail': 'auth required'}, status=status.HTTP_401_UNAUTHORIZED)

    User = get_user_model()
    user = request.user

    if request.method == 'GET':
        return Response({'name': user.first_name or '', 'collegeId': user.username, 'email': user.email or ''})

    # PUT - update
    name = request.data.get('name')
    email = request.data.get('email')
    password = request.data.get('password')

    updated = False
    if name is not None:
        user.first_name = name
        updated = True
    if email is not None:
        user.email = email
        updated = True
    if password:
        user.set_password(password)
        updated = True

    if updated:
        user.save()
    return Response({'name': user.first_name or '', 'collegeId': user.username, 'email': user.email or ''})


@api_view(['POST'])
def logout_view(request):
    """Logs out the current user (dev)."""
    try:
        django_logout(request)
    except Exception:
        pass
    return Response({'detail': 'ok'})


@api_view(['GET'])
def items_stats(request):
    """Return aggregated counts for items.

    Response shape:
    {
      total: int,
      found: int,
      lost: int,
      available: int,   # shorthand: items not marked as found
      user: { total, found, lost } | null
    }
    """
    try:
        qs = Item.objects.all()
        total = qs.count()
        found = qs.filter(found=True).count()
        lost = total - found
        # available: interpret as not found
        available = lost

        user_counts = None
        if request.user and request.user.is_authenticated:
            uqs = qs.filter(owner=request.user)
            u_total = uqs.count()
            u_found = uqs.filter(found=True).count()
            u_lost = u_total - u_found
            user_counts = {'total': u_total, 'found': u_found, 'lost': u_lost}

        return Response({'total': total, 'found': found, 'lost': lost, 'available': available, 'user': user_counts})
    except Exception as e:
        return Response({'detail': 'error', 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
