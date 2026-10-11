import { openNotification } from "@/utils/hooks/useCommonToast";
import request from "@/_helpers/request";
import {
    TICKETS_LOADING,
    TICKETS_FETCHED,
    TICKETS_ERROR,
    TICKET_CREATING,
    TICKET_ADDED,
    TICKET_CREATE_ERROR,
    TICKET_UPDATING,
    TICKET_UPDATED,
    TICKET_UPDATE_ERROR,
    TICKET_STATS_FETCHED,
} from "@/redux/types";

export const getTickets = (hook, params) => {
    const { dispatch } = hook;

    dispatch({ type: TICKETS_LOADING, payload: params });

    return request
        .get("/api/v1/tickets", { params })
        .then((response) => {
            dispatch({ type: TICKETS_FETCHED, payload: response.data });
        })
        .catch((error) => {
            dispatch({ type: TICKETS_ERROR, payload: error.response?.data });
        });
};

export const getTicketStats = (hook) => {
    const { dispatch } = hook;

    return request
        .get("/api/v1/tickets/stats")
        .then((response) => {
            dispatch({ type: TICKET_STATS_FETCHED, payload: response.data });
        })
        .catch(() => {
            // The interceptor already surfaced the error; stats are non-critical.
        });
};

// Resolves to true on success so the form knows whether to reset.
export const addTicket = (ticketData, hook) => {
    const { dispatch } = hook;

    dispatch({ type: TICKET_CREATING });

    return request
        .post("/api/v1/tickets", ticketData)
        .then((response) => {
            dispatch({ type: TICKET_ADDED, payload: response.data });
            openNotification(
                "success",
                response.data?.message || "Ticket created successfully"
            );
            return true;
        })
        .catch((error) => {
            dispatch({ type: TICKET_CREATE_ERROR, payload: error.response?.data });
            return false;
        });
};

export const updateTicket = (ticketId, changes, hook) => {
    const { dispatch } = hook;

    dispatch({ type: TICKET_UPDATING, payload: { id: ticketId } });

    return request
        .patch(`/api/v1/tickets/${ticketId}`, changes)
        .then((response) => {
            dispatch({ type: TICKET_UPDATED, payload: response.data });
            return true;
        })
        .catch((error) => {
            dispatch({
                type: TICKET_UPDATE_ERROR,
                payload: { id: ticketId, ...error.response?.data },
            });
            return false;
        });
};
