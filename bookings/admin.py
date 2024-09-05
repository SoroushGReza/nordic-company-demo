from django.contrib import admin
from .models import Service, Booking, Availability


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ["name"]


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ["service", "user", "date_time", "created_at"]
    list_filter = ["service", "date_time"]
    search_fields = ["user__username", "service__name"]


@admin.register(Availability)
class AvailabilityAdmin(admin.ModelAdmin):
    list_display = ["date", "start_time", "end_time", "is_available"]
    list_filter = ["date", "is_available"]
    search_fields = ["date"]
