import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicRoute from "./components/auth/PublicRoute";
import Login from "./features/auth/page/Login";
import DashboardLayout from "./components/layout/DashboardLayout";
import Home from "./features/dashboard/page/Home";
import History from "./features/history/page/History";
import InvoiceForm from "./features/invoice/pages/InvoiceForm";
import InvoicePreview from "./features/invoice/pages/InvoicePreview";
import QuotationForm from "./features/quotation/pages/QuotationForm";
import QuotationPreview from "./features/quotation/pages/QuotationPreview";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route: Login Page (redirects to /dashboard/home if already logged in) */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* Protected Routes: Dashboard and all nested sub-routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Navigate to="home" replace />} />
              <Route path="home" element={<Home />} />
              <Route path="history" element={<History />} />
              <Route path="invoice" element={<InvoiceForm />} />
              <Route path="invoice/preview" element={<InvoicePreview />} />
              <Route path="quotation" element={<QuotationForm />} />
              <Route path="quotation/preview" element={<QuotationPreview />} />
              {/* Future routes */}
              {/* <Route path="proforma" element={<ProformaForm />} /> */}
            </Route>
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;