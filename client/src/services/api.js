import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request Interceptor: Attach JWT Bearer token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear invalid / expired session
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirect to login if not already on the login page
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authApi = {
  login: async (username, password) => {
    // FastAPI OAuth2PasswordRequestForm expects application/x-www-form-urlencoded
    const params = new URLSearchParams();
    params.append("username", username.trim());
    params.append("password", password);

    const response = await api.post("/api/auth/login", params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return response.data;
  },

  logout: async () => {
    return api.post("/api/auth/logout");
  },

  checkHealth: async () => {
    return api.get("/api/health");
  },
};

// Customers API
export const customersApi = {
  list: async (search) => {
    const params = search ? { search } : {};
    const response = await api.get("/api/customers", { params });
    return response.data;
  },

  get: async (id) => {
    const response = await api.get(`/api/customers/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/api/customers", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/api/customers/${id}`, data);
    return response.data;
  },
};

// Quotations API
export const quotationsApi = {
  list: async (params = {}) => {
    const response = await api.get("/api/quotations", { params });
    return response.data;
  },

  get: async (id) => {
    const response = await api.get(`/api/quotations/${id}`);
    return response.data;
  },

  saveDraft: async (data) => {
    const response = await api.post("/api/quotations", data);
    return response.data;
  },

  updateDraft: async (id, data) => {
    const response = await api.put(`/api/quotations/${id}`, data);
    return response.data;
  },

  issue: async (id) => {
    const response = await api.post(`/api/quotations/${id}/issue`);
    return response.data;
  },

  getPdfBlob: async (id) => {
    const response = await api.get(`/api/quotations/${id}/pdf`, {
      responseType: "blob",
    });
    return response.data;
  },

  getPreviewPdfBlob: async (id) => {
    const response = await api.get(`/api/quotations/${id}/preview-pdf`, {
      responseType: "blob",
    });
    return response.data;
  },

  getNextNumber: async () => {
    const response = await api.get("/api/quotations/next-number");
    return response.data;
  },

  checkNumber: async (number, quotationId = null) => {
    const params = { number };
    if (quotationId) params.quotation_id = quotationId;
    const response = await api.get("/api/quotations/check-number", { params });
    return response.data;
  },

  viewPdfInNewTab: async (id) => {
    const blob = await quotationsApi.getPdfBlob(id);
    const fileUrl = URL.createObjectURL(blob);
    window.open(fileUrl, "_blank");
  },

  downloadPdf: async (id, filename = "quotation.pdf") => {
    const blob = await quotationsApi.getPdfBlob(id);
    const fileUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(fileUrl);
  },

  delete: async (id) => {
    const response = await api.delete(`/api/quotations/${id}`);
    return response.data;
  },
};

// Invoices API
export const invoicesApi = {
  list: async (params = {}) => {
    const response = await api.get("/api/invoices", { params });
    return response.data;
  },

  get: async (id) => {
    const response = await api.get(`/api/invoices/${id}`);
    return response.data;
  },

  saveDraft: async (data) => {
    const response = await api.post("/api/invoices", data);
    return response.data;
  },

  updateDraft: async (id, data) => {
    const response = await api.put(`/api/invoices/${id}`, data);
    return response.data;
  },

  issue: async (id) => {
    const response = await api.post(`/api/invoices/${id}/issue`);
    return response.data;
  },

  getPdfBlob: async (id) => {
    const response = await api.get(`/api/invoices/${id}/pdf`, {
      responseType: "blob",
    });
    return response.data;
  },

  getPreviewPdfBlob: async (id) => {
    const response = await api.get(`/api/invoices/${id}/preview-pdf`, {
      responseType: "blob",
    });
    return response.data;
  },

  getNextNumber: async () => {
    const response = await api.get("/api/invoices/next-number");
    return response.data;
  },

  checkNumber: async (number, invoiceId = null) => {
    const params = { number };
    if (invoiceId) params.invoice_id = invoiceId;
    const response = await api.get("/api/invoices/check-number", { params });
    return response.data;
  },

  viewPdfInNewTab: async (id) => {
    const blob = await invoicesApi.getPdfBlob(id);
    const fileUrl = URL.createObjectURL(blob);
    window.open(fileUrl, "_blank");
  },

  downloadPdf: async (id, filename = "invoice.pdf") => {
    const blob = await invoicesApi.getPdfBlob(id);
    const fileUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(fileUrl);
  },

  delete: async (id) => {
    const response = await api.delete(`/api/invoices/${id}`);
    return response.data;
  },
};

export default api;
