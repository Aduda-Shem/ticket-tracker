from django.contrib import admin

from ticket.models import Ticket


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ("title", "status", "priority", "created_at")
    list_filter = ("status", "priority")
    search_fields = ("title",)
