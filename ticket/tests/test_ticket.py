import uuid

from rest_framework import status
from rest_framework.test import APITestCase, APIClient

from ticket.models import Ticket


class TicketCreateAPITest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = "/api/v1/tickets"

    def test_create_ticket(self):
        data = {
            "title": "  Printer on 3rd floor jammed  ",
            "description": "Paper tray 2",
            "priority": "high",
        }
        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["message"], "Ticket created successfully")
        ticket = response.data["ticket"]
        self.assertEqual(ticket["title"], "Printer on 3rd floor jammed")
        self.assertEqual(ticket["status"], "open")
        self.assertEqual(ticket["priority"], "high")
        self.assertIsNotNone(ticket["created_at"])
        self.assertTrue(Ticket.objects.filter(id=ticket["id"]).exists())

    def test_create_ticket_applies_defaults(self):
        response = self.client.post(self.url, {"title": "VPN down"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["ticket"]["status"], "open")
        self.assertEqual(response.data["ticket"]["priority"], "medium")
        self.assertEqual(response.data["ticket"]["description"], "")

    def test_create_ticket_requires_title(self):
        for payload in ({}, {"title": ""}, {"title": "   "}):
            response = self.client.post(self.url, payload, format="json")
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
            self.assertIn("title", response.data["errors"])
        self.assertEqual(Ticket.objects.count(), 0)

    def test_create_ticket_rejects_invalid_enum(self):
        response = self.client.post(
            self.url, {"title": "Bad", "priority": "urgent"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("priority", response.data["errors"])


class TicketListAPITest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = "/api/v1/tickets"

        for i in range(5):
            Ticket.objects.create(title=f"Open {i}", status=Ticket.OPEN)
        for i in range(2):
            Ticket.objects.create(title=f"Closed {i}", status=Ticket.CLOSED)

    def test_list_tickets_paginates(self):
        response = self.client.get(self.url, {"page": 2, "limit": 3})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["tickets"]), 3)
        self.assertEqual(
            response.data["pagination"],
            {"page": 2, "limit": 3, "total": 7, "total_pages": 3},
        )

    def test_list_pages_do_not_overlap(self):
        first = self.client.get(self.url, {"page": 1, "limit": 4}).data["tickets"]
        second = self.client.get(self.url, {"page": 2, "limit": 4}).data["tickets"]

        ids = [t["id"] for t in first + second]
        self.assertEqual(len(ids), 7)
        self.assertEqual(len(set(ids)), 7)

    def test_list_tickets_filters_by_status(self):
        response = self.client.get(self.url, {"status": "closed"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["pagination"]["total"], 2)
        self.assertTrue(all(t["status"] == "closed" for t in response.data["tickets"]))

    def test_list_tickets_rejects_invalid_params(self):
        for params in ({"status": "done"}, {"page": 0}, {"limit": 1000}):
            response = self.client.get(self.url, params)
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class TicketUpdateAPITest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.ticket = Ticket.objects.create(title="Laptop won't boot")
        self.url = f"/api/v1/tickets/{self.ticket.id}"

    def test_update_ticket_status_and_priority(self):
        response = self.client.patch(
            self.url, {"status": "in_progress", "priority": "low"}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Ticket updated successfully")
        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.status, Ticket.IN_PROGRESS)
        self.assertEqual(self.ticket.priority, Ticket.LOW)

    def test_update_ticket_rejects_other_fields(self):
        response = self.client.patch(self.url, {"title": "Hacked"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.title, "Laptop won't boot")

    def test_update_ticket_requires_a_field(self):
        response = self.client.patch(self.url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_ticket_not_found(self):
        for ticket_id in (uuid.uuid4(), "not-a-uuid"):
            response = self.client.patch(
                f"/api/v1/tickets/{ticket_id}", {"status": "closed"}, format="json"
            )
            self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
            self.assertEqual(response.data["message"], "Ticket does not exist")


class TicketStatsAPITest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = "/api/v1/tickets/stats"

    def test_stats_with_no_tickets_returns_zeros(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["stats"],
            {"open": 0, "in_progress": 0, "closed": 0, "total": 0},
        )

    def test_stats_groups_by_status(self):
        Ticket.objects.bulk_create(
            [Ticket(title="a", status=Ticket.OPEN) for _ in range(3)]
            + [Ticket(title="b", status=Ticket.CLOSED)]
        )

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["stats"],
            {"open": 3, "in_progress": 0, "closed": 1, "total": 4},
        )

    def test_stats_reflect_status_updates(self):
        ticket = Ticket.objects.create(title="Moves along")
        self.client.patch(
            f"/api/v1/tickets/{ticket.id}", {"status": "closed"}, format="json"
        )

        stats = self.client.get(self.url).data["stats"]
        self.assertEqual(stats["open"], 0)
        self.assertEqual(stats["closed"], 1)
