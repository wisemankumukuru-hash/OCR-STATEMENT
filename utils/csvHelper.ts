
import { Transaction } from "../types";

export const downloadCSV = (transactions: Transaction[], filename: string = "statement_export.csv") => {
  const headers = ["Date", "Description", "Amount", "Notes"];
  const rows = transactions.map(t => [
    `"${t.date}"`,
    `"${t.description.replace(/"/g, '""')}"`,
    t.amount,
    `"${t.notes?.replace(/"/g, '""') || ''}"`
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map(r => r.join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
