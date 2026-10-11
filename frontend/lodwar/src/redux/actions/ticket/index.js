import { openNotification } from "@/utils/hooks/useCommonToast";
import request from "@/_helpers/request";
import {
    TICKETS_LOADING,
    TICKETS_FETCHED,
    TICKETS_ERROR,
    TICKET_UPDATED,
    TICKET_STATS_FETCHED,
} from "@/redux/types";

export const getTickets = (hook, params) => {
    const { dispatch } = hook;

    dispatch({ type: TICKETS_LOADING });

    return request
        .get("/api/v1/tickets", { params })
        .then((response) => dispatch({ type: TICKETS_FETCHED, payload: response.data }))
        .catch((error) => dispatch({ type: TICKETS_ERROR, payload: error.response?.data }));
};

export const getTicketStats = (hook) => {
    const { dispatch } = hook;

    return request
        .get("/api/v1/tickets/stats")
        .then((response) => dispatch({ type: TICKET_STATS_FETCHED, payload: response.data }))
        .catch(() => {}); // the interceptor already surfaced the error
};

// Create/update resolve to true on success; errors are toasted by the interceptor.
export const addTicket = (ticketData) =>
    request
        .post("/api/v1/tickets", ticketData)
        .then((response) => {
            openNotification("success", response.data?.message);
            return true;
        })
        .catch(() => false);

export const updateTicket = (ticketId, changes, hook) => {
    const { dispatch } = hook;

    return request
        .patch(`/api/v1/tickets/${ticketId}`, changes)
        .then((response) => {
            dispatch({ type: TICKET_UPDATED, payload: response.data });
            return true;
        })
        .catch(() => false);
};
