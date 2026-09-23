import ExcelJS from "exceljs";
import type { NextRequest } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-session";
import { exportOrders, parseOrderFilters, type OrderFilters } from "@/lib/admin-orders";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

const BRAND = "FF173F2A";
const CEDIS = '"GH₵" #,##0.00';
const DATE = "dd mmm yyyy hh:mm";

// Excel has no timezone; Ghana is UTC+0 all year, so UTC timestamps are local times.
const toCedis = (pesewas: number) => pesewas / 100;
const label = { new: "New", paid: "Paid", ready: "Ready", completed: "Completed", cancelled: "Cancelled" } as const;

function styleHeader(ws: ExcelJS.Worksheet) {
  const header = ws.getRow(1);
  header.font = { bold: true, color: { argb: "FFFFFFFF" } };
  header.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND } };
  header.alignment = { vertical: "middle" };
  header.height = 22;
  ws.views = [{ state: "frozen", ySplit: 1 }];
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: ws.columnCount } };
}

function addTotalRow(ws: ExcelJS.Worksheet, labelCol: string, sumCols: string[], lastDataRow: number) {
  if (lastDataRow < 2) return;
  const row = ws.addRow({});
  row.getCell(labelCol).value = "Total";
  for (const col of sumCols) {
    const letter = ws.getColumn(col).letter;
    row.getCell(col).value = { formula: `SUBTOTAL(9,${letter}2:${letter}${lastDataRow})` };
  }
  row.font = { bold: true };
  row.border = { top: { style: "double", color: { argb: BRAND } } };
}

function describeFilters(f: OrderFilters) {
  const parts = [`Status: ${f.status === "open" ? "Open (new, paid, ready)" : f.status === "all" ? "All" : label[f.status]}`];
  if (f.from || f.to) parts.push(`Dates: ${f.from || "any"} to ${f.to || "any"}`);
  if (f.q) parts.push(`Search: "${f.q}"`);
  if (f.fulfilment) parts.push(`Fulfilment: ${f.fulfilment}`);
  if (f.payment) parts.push(`Payment: ${f.payment === "momo" ? "MoMo" : "Cash"}`);
  return parts.join(" · ");
}

export async function GET(request: NextRequest) {
  const me = await getCurrentAdmin();
  if (!me) return new Response("Not signed in", { status: 401 });

  const filters = parseOrderFilters(request.nextUrl.searchParams);
  const orders = await exportOrders(filters);

  const wb = new ExcelJS.Workbook();
  wb.creator = `${site.name} admin (@${me.username})`;
  wb.created = new Date();

  // Sheet 1: one row per order
  const ws = wb.addWorksheet("Orders");
  ws.columns = [
    { header: "Order #", key: "code", width: 12 },
    { header: "Date", key: "date", width: 18, style: { numFmt: DATE } },
    { header: "Customer", key: "customer", width: 24 },
    { header: "Phone", key: "phone", width: 15 },
    { header: "Status", key: "status", width: 12 },
    { header: "Fulfilment", key: "fulfilment", width: 11 },
    { header: "Delivery address", key: "address", width: 30 },
    { header: "Payment", key: "payment", width: 10 },
    { header: "Items", key: "items", width: 48 },
    { header: "Qty", key: "qty", width: 7 },
    { header: "Subtotal", key: "subtotal", width: 14, style: { numFmt: CEDIS } },
    { header: "Customer note", key: "note", width: 30 },
    { header: "Status changed", key: "statusAt", width: 18, style: { numFmt: DATE } },
    { header: "Changed by", key: "statusBy", width: 14 },
  ];
  for (const o of orders) {
    ws.addRow({
      code: o.code,
      date: new Date(o.createdAt),
      customer: o.customerName,
      phone: o.phone,
      status: label[o.status],
      fulfilment: o.fulfilment === "pickup" ? "Pickup" : "Delivery",
      address: o.address ?? "",
      payment: o.paymentMethod === "momo" ? "MoMo" : "Cash",
      items: o.items.map((i) => `${i.quantity} x ${i.name}`).join(", "),
      qty: o.itemCount,
      subtotal: toCedis(o.subtotalPesewas),
      note: o.note ?? "",
      statusAt: o.statusUpdatedAt ? new Date(o.statusUpdatedAt) : null,
      statusBy: o.statusUpdatedBy ?? "",
    });
  }
  styleHeader(ws);
  addTotalRow(ws, "customer", ["qty", "subtotal"], orders.length + 1);
  ws.getColumn("items").alignment = { wrapText: true, vertical: "top" };

  // Sheet 2: one row per product line, handy for pivot tables (what sells best, etc.)
  const wi = wb.addWorksheet("Order items");
  wi.columns = [
    { header: "Order #", key: "code", width: 12 },
    { header: "Date", key: "date", width: 18, style: { numFmt: DATE } },
    { header: "Customer", key: "customer", width: 24 },
    { header: "Status", key: "status", width: 12 },
    { header: "Product", key: "product", width: 36 },
    { header: "Unit price", key: "price", width: 13, style: { numFmt: CEDIS } },
    { header: "Qty", key: "qty", width: 7 },
    { header: "Line total", key: "total", width: 14, style: { numFmt: CEDIS } },
  ];
  let lines = 0;
  for (const o of orders) {
    for (const i of o.items) {
      lines++;
      wi.addRow({
        code: o.code,
        date: new Date(o.createdAt),
        customer: o.customerName,
        status: label[o.status],
        product: i.name,
        price: toCedis(i.unitPricePesewas),
        qty: i.quantity,
        total: toCedis(i.unitPricePesewas * i.quantity),
      });
    }
  }
  styleHeader(wi);
  addTotalRow(wi, "product", ["qty", "total"], lines + 1);

  // Sheet 3: what this file contains
  const info = wb.addWorksheet("About this export");
  info.columns = [{ width: 18 }, { width: 70 }];
  info.addRows([
    ["Business", site.legalName],
    ["Exported", new Date().toLocaleString("en-GB", { timeZone: "Africa/Accra" })],
    ["Exported by", `@${me.username}`],
    ["Filters", describeFilters(filters)],
    ["Orders", orders.length],
    ["Note", "Totals use SUBTOTAL, so they update when you filter rows in Excel. Delivery fees are not included."],
  ]);
  info.getColumn(1).font = { bold: true };

  const buffer = await wb.xlsx.writeBuffer();
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="orders-${filters.status}-${stamp}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
