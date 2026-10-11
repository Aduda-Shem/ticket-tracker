import uuid

from django.db import models


class Ticket(models.Model):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    CLOSED = "closed"

    STATUS_CHOICES = (
        (OPEN, "Open"),
        (IN_PROGRESS, "In Progress"),
        (CLOSED, "Closed"),
    )

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

    PRIORITY_CHOICES = (
        (LOW, "Low"),
        (MEDIUM, "Medium"),
        (HIGH, "High"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=OPEN)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default=MEDIUM)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "ticket"
        # `id` breaks ties so pagination is stable when timestamps collide.
        ordering = ["-created_at", "-id"]
        indexes = [
            # Covers the list endpoint: filter by status, newest first.
            models.Index(fields=["status", "-created_at"]),
        ]

    def __str__(self):
        return self.title
