import { customersApi, invoicesApi, quotationsApi } from "./api";

/**
 * Readable message from an API error. Preview requests ask for a Blob, so an
 * error body arrives as a Blob too and has to be read as JSON first.
 */
export async function getErrorMessage(err) {
  let data = err?.response?.data;
  if (data instanceof Blob || data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
    try {
      const text =
        data instanceof Blob ? await data.text() : new TextDecoder().decode(data);
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }
  const detail = data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
  return err?.message || "Something went wrong.";
}

const todayIso = () => new Date().toISOString().split("T")[0];

// The printed invoice uses DD.MM.YYYY; date inputs give YYYY-MM-DD.
const toInvoiceDate = (value) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((value || "").trim());
  return m ? `${m[3]}.${m[2]}.${m[1]}` : (value || "").trim();
};

const splitLines = (text) =>
  (text || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

/**
 * Find the customer by name (case-insensitive), update it with the latest
 * details, or create it. Returns the customer id.
 */
function customerPayload({ name, address, stateCode, gstin }) {
  const lines = splitLines(address);
  const payload = {
    name,
    address_lines: lines.length ? lines : [name],
    gstin: gstin?.trim().toUpperCase() || null,
  };
  if (stateCode) payload.state_code = stateCode;
  return payload;
}

async function resolveCustomerId(customer) {
  const { name } = customer;
  const payload = customerPayload(customer);

  try {
    const found = await customersApi.list(name);
    const match = found.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (match) {
      await customersApi.update(match.id, payload);
      return match.id;
    }
    const created = await customersApi.create(payload);
    return created.id;
  } catch (err) {
    throw new Error(err.response?.data?.detail || "Failed to process customer.", { cause: err });
  }
}

function buildItems(products, { defaultUom, maxItems }) {
  const items = products
    .filter((p) => p.description && p.description.trim())
    .map((p) => ({
      description: p.description.trim(),
      hsn: p.hsn?.trim() || "",
      qty: parseFloat(p.quantity) || 1,
      uom: p.uom?.trim() || defaultUom,
      rate: parseFloat(p.rate) || 0,
    }));

  if (items.length === 0) {
    throw new Error("Please add at least one product with a description and rate.");
  }
  if (maxItems && items.length > maxItems) {
    throw new Error(`This document supports a maximum of ${maxItems} items.`);
  }
  return items;
}

// ── Invoice ────────────────────────────────────────────────

export const INVOICE_MAX_ITEMS = 5;

/** Returns an error message string, or null when the form data is valid. */
export function validateInvoiceInput(customerData, products) {
  if (!customerData.customerName?.trim()) return "Customer Name is required.";
  try {
    buildItems(products, { defaultUom: "Nos.", maxItems: INVOICE_MAX_ITEMS });
  } catch (err) {
    return err.message;
  }
  return null;
}

const invoiceCustomer = (customerData) => ({
  name: customerData.customerName.trim(),
  address: customerData.address,
  stateCode: customerData.stateCode || "33",
  gstin: customerData.gstin,
});

const invoiceBody = (invoiceData, products) => ({
  invoice_date: toInvoiceDate(invoiceData.invoiceDate || todayIso()),
  po_number: invoiceData.poNo?.trim() || null,
  po_date: toInvoiceDate(invoiceData.poDate) || null,
  copy_type: "original",
  gst_rate: 18.0,
  items: buildItems(products, { defaultUom: "Nos.", maxItems: INVOICE_MAX_ITEMS }),
  invoice_number: invoiceData.invoiceNo?.trim() || null,
});

/** Real invoice PDF (a Blob) rendered from the form data. Saves nothing. */
export async function previewInvoice({ customerData, invoiceData, products }) {
  const error = validateInvoiceInput(customerData, products);
  if (error) throw new Error(error);

  return invoicesApi.preview({
    customer: customerPayload(invoiceCustomer(customerData)),
    ...invoiceBody(invoiceData, products),
  });
}

/** Creates, numbers and issues the invoice in one backend call. */
export async function generateInvoice({ customerData, invoiceData, products }) {
  const error = validateInvoiceInput(customerData, products);
  if (error) throw new Error(error);

  const customerId = await resolveCustomerId(invoiceCustomer(customerData));
  return invoicesApi.generate({
    customer_id: customerId,
    ...invoiceBody(invoiceData, products),
  });
}

// ── Quotation ──────────────────────────────────────────────

const quotationCompanyName = (letterData, quotationData) =>
  letterData.companyName?.trim() || quotationData.companyName?.trim() || "";

/** Returns an error message string, or null when the form data is valid. */
export function validateQuotationInput(letterData, quotationData, products) {
  if (!quotationCompanyName(letterData, quotationData)) {
    return "Client / Company Name is required.";
  }
  try {
    buildItems(products, { defaultUom: "Nos" });
  } catch (err) {
    return err.message;
  }
  return null;
}

const quotationCustomer = (letterData, quotationData) => ({
  name: quotationCompanyName(letterData, quotationData),
  address: letterData.address || quotationData.address,
  gstin: quotationData.gstin,
});

const quotationBody = (letterData, quotationData, products) => ({
  quotation_date: quotationData.quoteDate || letterData.date || todayIso(),
  subject: letterData.subject?.trim() || "Quotation",
  items: buildItems(products, { defaultUom: "Nos" }),
  quotation_number: quotationData.quoteNo?.trim() || null,
});

/** Real quotation PDF (a Blob) rendered from the form data. Saves nothing. */
export async function previewQuotation({ letterData, quotationData, products }) {
  const error = validateQuotationInput(letterData, quotationData, products);
  if (error) throw new Error(error);

  return quotationsApi.preview({
    customer: customerPayload(quotationCustomer(letterData, quotationData)),
    ...quotationBody(letterData, quotationData, products),
  });
}

/** Creates, numbers and issues the quotation in one backend call. */
export async function generateQuotation({ letterData, quotationData, products }) {
  const error = validateQuotationInput(letterData, quotationData, products);
  if (error) throw new Error(error);

  const customerId = await resolveCustomerId(quotationCustomer(letterData, quotationData));
  return quotationsApi.generate({
    customer_id: customerId,
    ...quotationBody(letterData, quotationData, products),
  });
}
