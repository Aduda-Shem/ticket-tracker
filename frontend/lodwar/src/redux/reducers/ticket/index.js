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

const initialState = {
  loading: false,
  creating: false,
  createErrors: null,
  updatingIds: [],
  list: [],
  pagination: { page: 1, limit: 10, total: 0, total_pages: 0 },
  stats: null,
  error: null,
};

const ticketReducer = (state = initialState, action) => {
  switch (action.type) {
    case TICKETS_LOADING:
      state = { ...state, loading: true, error: null };
      break;

    case TICKETS_FETCHED:
      state = {
        ...state,
        loading: false,
        list: action.payload?.tickets || [],
        pagination: action.payload?.pagination || initialState.pagination,
      };
      break;

    case TICKETS_ERROR:
      state = {
        ...state,
        loading: false,
        error: action.payload?.message || "Failed to load tickets",
      };
      break;

    case TICKET_CREATING:
      state = { ...state, creating: true, createErrors: null };
      break;

    // The list is refetched after create so filters/pagination stay correct.
    case TICKET_ADDED:
      state = { ...state, creating: false };
      break;

    case TICKET_CREATE_ERROR:
      state = {
        ...state,
        creating: false,
        createErrors: action.payload?.errors || null,
      };
      break;

    case TICKET_UPDATING:
      state = {
        ...state,
        updatingIds: [...state.updatingIds, action.payload.id],
      };
      break;

    case TICKET_UPDATED:
      state = {
        ...state,
        updatingIds: state.updatingIds.filter(
          (id) => id !== action.payload?.ticket?.id
        ),
        list: state.list.map((ticket) =>
          ticket.id === action.payload?.ticket?.id
            ? action.payload.ticket
            : ticket
        ),
      };
      break;

    case TICKET_UPDATE_ERROR:
      state = {
        ...state,
        updatingIds: state.updatingIds.filter((id) => id !== action.payload.id),
      };
      break;

    case TICKET_STATS_FETCHED:
      state = { ...state, stats: action.payload?.stats || null };
      break;

    default:
      break;
  }
  return state;
};

export default ticketReducer;
