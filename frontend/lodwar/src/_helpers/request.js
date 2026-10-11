import axios from "axios";
import { openNotification } from "@/utils/hooks/useCommonToast";

// Same-origin: Django serves the bundle, and Vite proxies /api in dev.
const request = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  headers: { "Content-Type": "application/json" },
});

request.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    if (!response) {
      openNotification("danger", "Network error. Is the API running?");
    } else if (response.status >= 500) {
      openNotification(
        "danger",
        "Oops! Something went wrong on the server. Please try again later."
      );
    } else {
      openNotification(
        "warning",
        response.data?.message || "The request could not be completed."
      );
    }

    return Promise.reject(error);
  }
);

export default request;
