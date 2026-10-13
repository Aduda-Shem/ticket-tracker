import {
  TICKETS_LOADING,
  TICKETS_FETCHED,
  TICKETS_ERROR,
  TICKET_UPDATED,
  TICKET_STATS_FETCHED,
} from "@/redux/types";

const initialState = {
  loading: false,
  list: [],
  pagination: { page: 1, limit: 10, total: 0, total_pages: 0 },
  stats: null,
  error: null,
};

const ticketReducer = (state = initialState, action) => {
  switch (action.type) {
    case TICKETS_LOADING:
      return { ...state, loading: true, error: null };

    case TICKETS_FETCHED:
      return {
        ...state,
        loading: false,
        list: action.payload.tickets,
        pagination: action.payload.pagination,
      };

    case TICKETS_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload?.message || "Failed to load tickets",
      };

    // Swap the row in place for instant feedback; a refetch follows.
    case TICKET_UPDATED:
      return {
        ...state,
        list: state.list.map((ticket) =>
          ticket.id === action.payload.ticket.id
            ? action.payload.ticket
            : ticket,
        ),
      };

    case TICKET_STATS_FETCHED:
      return { ...state, stats: action.payload.stats };

    default:
      return state;
  }
};

export default ticketReducer;
