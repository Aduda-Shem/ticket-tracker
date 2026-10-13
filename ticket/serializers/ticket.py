from rest_framework import serializers

from ticket.constants import DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT
from ticket.models import Ticket


class TicketSerializer(serializers.ModelSerializer):
    title = serializers.CharField(required=True, allow_blank=False, max_length=255)

    class Meta:
        model = Ticket
        fields = [
            "id",
            "title",
            "description",
            "status",
            "priority",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_title(self, value: str):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Title cannot be empty.")
        return value


class TicketUpdateSerializer(serializers.ModelSerializer):
    """PATCH is limited to status and priority; anything else is rejected."""

    class Meta:
        model = Ticket
        fields = ["status", "priority"]

    def validate(self, attrs):
        unknown = set(self.initial_data) - set(self.fields)
        if unknown:
            raise serializers.ValidationError(
                f"Only status and priority can be updated. "
                f"Unexpected field(s): {', '.join(sorted(unknown))}"
            )
        if not attrs:
            raise serializers.ValidationError(
                "Provide at least one of: status, priority."
            )
        return attrs

    def update(self, instance, validated_data):
        """Write only the changed columns instead of the whole row."""
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save(update_fields=[*validated_data, "updated_at"])
        return instance


class TicketListQuerySerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Ticket.STATUS_CHOICES, required=False)
    page = serializers.IntegerField(min_value=1, default=DEFAULT_PAGE)
    limit = serializers.IntegerField(
        min_value=1, max_value=MAX_LIMIT, default=DEFAULT_LIMIT
    )


class PaginationSerializer(serializers.Serializer):
    page = serializers.IntegerField()
    limit = serializers.IntegerField()
    total = serializers.IntegerField()
    total_pages = serializers.IntegerField()


class TicketStatsSerializer(serializers.Serializer):
    open = serializers.IntegerField()
    in_progress = serializers.IntegerField()
    closed = serializers.IntegerField()
    total = serializers.IntegerField()


class TicketListSerializerResponse(serializers.Serializer):
    message = serializers.CharField(read_only=True)
    tickets = TicketSerializer(many=True)
    pagination = PaginationSerializer()


class TicketSerializerResponse(serializers.Serializer):
    message = serializers.CharField(read_only=True)
    ticket = TicketSerializer()


class TicketStatsSerializerResponse(serializers.Serializer):
    message = serializers.CharField(read_only=True)
    stats = TicketStatsSerializer()
