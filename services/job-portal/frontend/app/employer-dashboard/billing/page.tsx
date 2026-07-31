"use client";

import { useGetMyPayments } from "@/features/employer/hooks/use-payments";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

export default function BillingPage() {
  const { data: response, isLoading } = useGetMyPayments();
  const payments = response?.data || [];

  const handleDownloadInvoice = (payment: any) => {
    const doc = new jsPDF();
    const date = format(new Date(payment.createdAt), "dd MMM, yyyy");
    
    // Add Company/Platform info
    doc.setFontSize(22);
    doc.text("INVOICE", 14, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text("Job Portal Platform", 14, 30);
    
    // Invoice details
    doc.setTextColor(0);
    doc.text(`Invoice ID: ${payment.razorpayOrderId}`, 14, 45);
    doc.text(`Date: ${date}`, 14, 52);
    doc.text(`Status: ${payment.status}`, 14, 59);

    const amount = payment.amount / 100;
    const planName = payment.metadata?.planId || "Plan Subscription";

    autoTable(doc, {
      startY: 70,
      head: [["Description", "Amount"]],
      body: [
        [planName, `${payment.currency} ${amount.toFixed(2)}`],
      ],
      theme: "striped",
      headStyles: { fillColor: [37, 99, 235] },
    });
    
    const finalY = (doc as any).lastAutoTable.finalY || 90;
    doc.text(`Total: ${payment.currency} ${amount.toFixed(2)}`, 14, finalY + 10);
    
    doc.save(`invoice_${payment.razorpayOrderId}.pdf`);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Billing & Payments</h1>
      
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Loading payments...
                </TableCell>
              </TableRow>
            ) : payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No payment history found.
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment: any) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    {format(new Date(payment.createdAt), "dd MMM, yyyy")}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{payment.razorpayOrderId}</TableCell>
                  <TableCell>
                    {payment.currency} {(payment.amount / 100).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      payment.status === "CAPTURED" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                      payment.status === "FAILED" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                      "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                    }`}>
                      {payment.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {payment.status === "CAPTURED" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadInvoice(payment)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Invoice
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
