import math
import uuid

from django.db.models import Count
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from ticket.models import Ticket
from ticket.serializers.ticket import (
    TicketSerializer,
    TicketUpdateSerializer,
    TicketListQuerySerializer,
    TicketListSerializerResponse,
    TicketSerializerResponse,
    TicketStatsSerializerResponse,
)


class TicketAPIView(APIView):

    @swagger_auto_schema(
        query_serializer=TicketListQuerySerializer,
        responses={200: TicketListSerializerResponse()},
    )
    def get(self, request):
        query = TicketListQuerySerializer(data=request.query_params)
        query.is_valid(raise_exception=True)
        ticket_status = query.validated_data.get("status")
        page = query.validated_data["page"]
        limit = query.validated_data["limit"]

        tickets = Ticket.objects.all()
        if ticket_status:
            tickets = tickets.filter(status=ticket_status)

        total = tickets.count()
        offset = (page - 1) * limit
        serializer = TicketSerializer(tickets[offset : offset + limit], many=True)

        return Response(
            {
                "message": "Tickets fetched successfully",
                "tickets": serializer.data,
                "pagination": {
                    "page": page,
                    "limit": limit,
                    "total": total,
                    "total_pages": math.ceil(total / limit),
                },
            },
            status=status.HTTP_200_OK,
        )

    @swagger_auto_schema(
        request_body=TicketSerializer,
        responses={201: TicketSerializerResponse()},
    )
    def post(self, request):
        serializer = TicketSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        ticket = serializer.save()

        return Response(
            {
                "message": "Ticket created successfully",
                "ticket": TicketSerializer(ticket).data,
            },
            status=status.HTTP_201_CREATED,
        )


class TicketDetailAPIView(APIView):

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                name="ticket_id",
                in_=openapi.IN_PATH,
                description="The ID of the ticket to update",
                type=openapi.TYPE_STRING,
                required=True,
            )
        ],
        request_body=TicketUpdateSerializer,
        responses={200: TicketSerializerResponse()},
    )
    def patch(self, request, ticket_id):
        ticket = self._get_ticket(ticket_id)
        if ticket is None:
            return Response(
                {"message": "Ticket does not exist"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = TicketUpdateSerializer(ticket, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {
                "message": "Ticket updated successfully",
                "ticket": TicketSerializer(ticket).data,
            },
            status=status.HTTP_200_OK,
        )

    def _get_ticket(self, ticket_id):
        """Return the ticket, or None for a malformed or unknown id."""
        try:
            return Ticket.objects.get(id=uuid.UUID(str(ticket_id)))
        except (ValueError, Ticket.DoesNotExist):
            return None


class TicketStatsAPIView(APIView):

    @swagger_auto_schema(responses={200: TicketStatsSerializerResponse()})
    def get(self, request):
        counts = dict(
            Ticket.objects.order_by()
            .values_list("status")
            .annotate(count=Count("id"))
        )
        # Always return every status so clients don't have to handle gaps.
        stats = {value: counts.get(value, 0) for value, _ in Ticket.STATUS_CHOICES}
        stats["total"] = sum(stats.values())

        return Response(
            {"message": "Ticket stats fetched successfully", "stats": stats},
            status=status.HTTP_200_OK,
        )
