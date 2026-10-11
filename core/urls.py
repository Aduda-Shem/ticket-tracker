"""
URL configuration for core project.
"""

from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="Tickets API",
        default_version="v1",
        description="Ticket Tracker",
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)
urlpatterns = [
    path("api/v1/", include("ticket.urls")),
    path("admin/", admin.site.urls),
    path(
        "swagger<format>/", schema_view.without_ui(cache_timeout=0), name="schema-json"
    ),
    path(
        "swagger/",
        schema_view.with_ui("swagger", cache_timeout=0),
        name="schema-swagger-ui",
    ),
    re_path(r"^(?!api|admin|swagger|static).*", include("frontend.urls")),
]
