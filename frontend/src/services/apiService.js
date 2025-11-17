import api from "../api/axiosClient";
import { toast } from "../utils/toast"; // we will create this
import delay from "../utils/delay"; // small helper

const apiService = {
  request: async (method, url, { body = {}, params = {}, retry = 0, successMessage } = {}) => {
    let attempt = 0;

    while (true) {
      try {
        const res = await api({
          method,
          url,
          data: body,
          params,
        });

        if (successMessage) {
          toast.success(successMessage);
        }

        return res.data;

      } catch (error) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong";

        if (attempt < retry) {
          attempt++;
          await delay(400);
          continue; // retry again
        }

        toast.error(message);
        throw message;
      }
    }
  },

  get(url, options = {}) {
    return this.request("GET", url, options);
  },

  post(url, body, options = {}) {
    return this.request("POST", url, { ...options, body });
  },

  put(url, body, options = {}) {
    return this.request("PUT", url, { ...options, body });
  },

  delete(url, options = {}) {
    return this.request("DELETE", url, options);
  },
};

export default apiService;
