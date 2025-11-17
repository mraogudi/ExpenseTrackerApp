import { useState, useCallback } from "react";
import apiService from "../services/apiService";

export default function useApi() {
  const [loading, setLoading] = useState(false);

  const execute = useCallback(async (method, url, { body, params, retry, successMessage } = {}) => {
    setLoading(true);
    try {
      const data = await apiService.request(method, url, { body, params, retry, successMessage });
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    get: (url, opts) => execute("GET", url, opts),
    post: (url, body, opts) => execute("POST", url, { ...opts, body }),
    put: (url, body, opts) => execute("PUT", url, { ...opts, body }),
    del: (url, opts) => execute("DELETE", url, opts),
  };
}

