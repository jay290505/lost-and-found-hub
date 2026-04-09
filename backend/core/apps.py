from django.apps import AppConfig
from django.conf import settings


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'

    def ready(self):
        # Create a default admin superuser after migrations finish.
        # Use environment variables for credentials so this can be controlled.
        if not settings.DEBUG:
            return

        try:
            from django.db.models.signals import post_migrate
            from django.contrib.auth import get_user_model
            import os

            def _create_admin(sender, **kwargs):
                User = get_user_model()
                admin_username = os.environ.get('DJANGO_ADMIN_USERNAME', 'admin')
                admin_password = os.environ.get('DJANGO_ADMIN_PASSWORD', 'adminpass')
                admin_email = os.environ.get('DJANGO_ADMIN_EMAIL', 'admin@example.com')
                if not User.objects.filter(is_superuser=True).exists():
                    User.objects.create_superuser(admin_username, admin_email, admin_password)
                    print(f"Created default admin: {admin_username} / {admin_password}")

            post_migrate.connect(_create_admin, weak=False)
        except Exception:
            # Don't block startup if this fails
            pass
