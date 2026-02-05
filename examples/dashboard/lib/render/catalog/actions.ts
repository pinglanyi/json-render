import { toast } from "sonner";
import { findFormValue } from "@json-render/core";
import {
  type Actions,
  type ActionFn,
  type SetData,
  type DataModel,
} from "@json-render/react";
import { dashboardCatalog } from "../catalog";

// =============================================================================
// Action Handlers - Type-safe with Catalog
// =============================================================================

export const actionHandlers: Actions<typeof dashboardCatalog> = {
  viewCustomers: async (params, setData) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.set("limit", String(params.limit));
    if (params?.sort) queryParams.set("sort", String(params.sort));
    if (params?.status) queryParams.set("status", String(params.status));
    const url = `/api/v1/customers${queryParams.toString() ? `?${queryParams}` : ""}`;
    const res = await fetch(url);
    const customers = await res.json();
    setData((prev) => ({ ...prev, customers }));
  },

  refreshCustomers: async (params, setData) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.set("limit", String(params.limit));
    if (params?.sort) queryParams.set("sort", String(params.sort));
    const url = `/api/v1/customers${queryParams.toString() ? `?${queryParams}` : ""}`;
    const res = await fetch(url);
    const customers = await res.json();
    setData((prev) => ({ ...prev, customers }));
  },

  createCustomer: async (params, setData, data) => {
    const name = findFormValue("name", params, data) as string;
    const email =
      (findFormValue("email", params, data) as string) ||
      `${name?.toLowerCase().replace(/\s+/g, ".")}@example.com`;
    const phone = findFormValue("phone", params, data) as string | undefined;

    if (!name) {
      toast.error("Customer name is required");
      return;
    }

    try {
      const res = await fetch("/api/v1/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone }),
      });
      const customer = await res.json();
      if (res.ok) {
        toast.success(`Customer "${customer.name}" created`);
        const listRes = await fetch("/api/v1/customers");
        const customers = await listRes.json();
        setData((prev) => ({ ...prev, customers }));
      } else {
        toast.error(customer.error || "Failed to create customer");
      }
    } catch (err) {
      console.error("Failed to create customer:", err);
      toast.error("Failed to create customer");
    }
  },

  deleteCustomer: async (params, setData, data) => {
    const customerId =
      findFormValue("customerId", params, data) ||
      findFormValue("id", params, data);
    if (!customerId) {
      toast.error("Customer ID required");
      return;
    }
    try {
      const res = await fetch(`/api/v1/customers/${customerId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Customer deleted");
        const listRes = await fetch("/api/v1/customers");
        const customers = await listRes.json();
        setData((prev) => ({ ...prev, customers }));
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to delete customer");
      }
    } catch (err) {
      console.error("Failed to delete customer:", err);
      toast.error("Failed to delete customer");
    }
  },

  viewInvoices: async (params, setData) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.set("status", String(params.status));
    const url = `/api/v1/invoices${queryParams.toString() ? `?${queryParams}` : ""}`;
    const res = await fetch(url);
    const invoices = await res.json();
    setData((prev) => ({ ...prev, invoices }));
  },

  refreshInvoices: async (_params, setData) => {
    const res = await fetch("/api/v1/invoices");
    const invoices = await res.json();
    setData((prev) => ({ ...prev, invoices }));
  },

  createInvoice: async (params, setData) => {
    if (!params?.customerId || !params?.dueDate) {
      toast.error("Customer ID and due date required");
      return;
    }
    try {
      const res = await fetch("/api/v1/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const invoice = await res.json();
      if (res.ok) {
        toast.success("Invoice created");
        const listRes = await fetch("/api/v1/invoices");
        const invoices = await listRes.json();
        setData((prev) => ({ ...prev, invoices }));
      } else {
        toast.error(invoice.error || "Failed to create invoice");
      }
    } catch (err) {
      console.error("Failed to create invoice:", err);
      toast.error("Failed to create invoice");
    }
  },

  sendInvoice: async (params) => {
    if (!params?.invoiceId) {
      toast.error("Invoice ID required");
      return;
    }
    const res = await fetch(`/api/v1/invoices/${params.invoiceId}/send`, {
      method: "POST",
    });
    const result = await res.json();
    if (res.ok) {
      toast.success(result.message || "Invoice sent");
    } else {
      toast.error(result.error || "Failed to send invoice");
    }
  },

  markInvoicePaid: async (params) => {
    if (!params?.invoiceId) {
      toast.error("Invoice ID required");
      return;
    }
    const res = await fetch(`/api/v1/invoices/${params.invoiceId}/mark-paid`, {
      method: "POST",
    });
    const result = await res.json();
    if (res.ok) {
      toast.success(result.message || "Invoice marked paid");
    } else {
      toast.error(result.error || "Failed to mark invoice paid");
    }
  },

  viewExpenses: async (params, setData) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.set("status", String(params.status));
    const url = `/api/v1/expenses${queryParams.toString() ? `?${queryParams}` : ""}`;
    const res = await fetch(url);
    const expenses = await res.json();
    setData((prev) => ({ ...prev, expenses }));
  },

  refreshExpenses: async (_params, setData) => {
    const res = await fetch("/api/v1/expenses");
    const expenses = await res.json();
    setData((prev) => ({ ...prev, expenses }));
  },

  createExpense: async (params, setData) => {
    if (!params?.vendor || !params?.category || params?.amount === undefined) {
      toast.error("Vendor, category, and amount required");
      return;
    }
    try {
      const res = await fetch("/api/v1/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const expense = await res.json();
      if (res.ok) {
        toast.success("Expense created");
        const listRes = await fetch("/api/v1/expenses");
        const expenses = await listRes.json();
        setData((prev) => ({ ...prev, expenses }));
      } else {
        toast.error(expense.error || "Failed to create expense");
      }
    } catch (err) {
      console.error("Failed to create expense:", err);
      toast.error("Failed to create expense");
    }
  },

  approveExpense: async (params) => {
    if (!params?.expenseId) {
      toast.error("Expense ID required");
      return;
    }
    const res = await fetch(`/api/v1/expenses/${params.expenseId}/approve`, {
      method: "POST",
    });
    const result = await res.json();
    if (res.ok) {
      toast.success(result.message || "Expense approved");
    } else {
      toast.error(result.error || "Failed to approve expense");
    }
  },
};

// =============================================================================
// Execute Action
// =============================================================================

type Catalog = typeof dashboardCatalog;
type CatalogActions = Catalog["data"]["actions"];

/**
 * Execute an action by name with the given parameters.
 */
export async function executeAction(
  actionName: string,
  params: Record<string, unknown> | undefined,
  setData: SetData,
  data: DataModel = {},
): Promise<void> {
  const handler = actionHandlers[actionName as keyof CatalogActions];
  if (handler) {
    await (handler as ActionFn<Catalog, keyof CatalogActions>)(
      params as never,
      setData,
      data,
    );
  } else {
    console.log("Unknown action:", actionName, params);
    toast(`Action: ${actionName}`);
  }
}
