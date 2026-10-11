from django.urls import re_path

from ticket.views import TicketAPIView, TicketDetailAPIView, TicketStatsAPIView

app_name = "ticket"

# Trailing slash is optional so both `/tickets` (as specified) and the
# Django-style `/tickets/` work without a POST-breaking redirect.
urlpatterns = [
    re_path(r"^tickets/?$", TicketAPIView.as_view(), name="tickets"),
    re_path(r"^tickets/stats/?$", TicketStatsAPIView.as_view(), name="ticket-stats"),
    re_path(
        r"^tickets/(?P<ticket_id>[^/]+)/?$",
        TicketDetailAPIView.as_view(),
        name="ticket-detail",
    ),
]
