from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser
from django.core.exceptions import PermissionDenied
from django.contrib import messages


class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ["email", "name", "surname", "is_staff", "is_active"]
    list_filter = ["is_staff", "is_active"]
    search_fields = ["email", "name", "surname"]
    ordering = ["email"]

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (
            "Personal info",
            {"fields": ("name", "surname", "phone_number", "profile_image")},
        ),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "user_permissions",
                )
            },
        ),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )

    # Custom fieldsets for user creation form
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "name",
                    "surname",
                    "phone_number",
                    "profile_image",
                    "password1",
                    "password2",
                    "is_active",
                    "is_staff",
                ),
            },
        ),
    )

    # Prevent deletion of admin/superuser in the admin panel
    def delete_model(self, request, obj):
        if obj.is_staff or obj.is_superuser:
            messages.error(
                request,
                "Admin and superuser accounts cannot be deleted in the demo version.",
            )
        else:
            super().delete_model(request, obj)


admin.site.register(CustomUser, CustomUserAdmin)
