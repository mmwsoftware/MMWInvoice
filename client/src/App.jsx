import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
    <BrowserRouter>
      <Routes>
        {/* Login Page - no navbar */}
        <Route path="/" element={<Login />} />

        {/* Dashboard - with navbar */}
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;