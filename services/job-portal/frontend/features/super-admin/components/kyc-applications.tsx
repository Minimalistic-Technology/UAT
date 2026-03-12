import React, { useState } from "react";
import { useKycApplications, useUpdateKycStatus } from "../hooks/use-kyc-applications";
import { Card } from "../../../components/ui/Card";
import { FileText, CheckCircle, XCircle, ExternalLink, RefreshCw } from "lucide-react";
import { IKycApplication } from "../super-admin.types";

export default function KycApplicationsTab() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const limit = 10;

  const { data, isLoading, isError, refetch } = useKycApplications(page, limit, statusFilter);
  const updateStatusMutation = useUpdateKycStatus();

  const handleUpdateStatus = (applicationId: string, newStatus: "approved" | "rejected") => {
    if (window.confirm(`Are you sure you want to mark this application as ${newStatus}?`)) {
      updateStatusMutation.mutate({ applicationId, status: newStatus });
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-red-500">
          <p>Error loading KYC applications.</p>
          <button
            onClick={() => refetch()}
            className="mt-4 flex items-center gap-2 text-primary-600 hover:text-primary-700"
          >
            <RefreshCw className="h-4 w-4" /> Try Again
          </button>
        </div>
      </Card>
    );
  }

  const applications = data?.data?.applications || [];
  const pagination = data?.data?.pagination;

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary-600" />
          Employer KYC Applications
        </h2>
        
        <div className="flex items-center gap-2">
          <label htmlFor="status-filter" className="text-sm text-gray-600">Filter:</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1); // Reset to first page on filter change
            }}
            className="border-gray-300 rounded-md shadow-xs focus:ring-primary-500 focus:border-primary-500 text-sm"
          >
            <option value="">All Applications</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-gray-200">
              <th className="pb-3 text-sm font-semibold text-gray-600">Company Details</th>
              <th className="pb-3 text-sm font-semibold text-gray-600">Identification</th>
              <th className="pb-3 text-sm font-semibold text-gray-600">Documents</th>
              <th className="pb-3 text-sm font-semibold text-gray-600">Status</th>
              <th className="pb-3 text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {applications.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  No KYC applications found.
                </td>
              </tr>
            ) : (
              applications.map((app: IKycApplication) => (
                <tr key={app._id} className="group hover:bg-gray-50 transition-colors">
                  <td className="py-4">
                    <p className="font-semibold text-gray-900">{app.companyName}</p>
                    <p className="text-sm text-gray-500">
                      {app.user?.firstName} {app.user?.lastName}
                    </p>
                    <p className="text-xs text-gray-400">{app.user?.email}</p>
                  </td>
                  <td className="py-4">
                    <div className="space-y-1 text-sm">
                      <p><span className="text-gray-500">Aadhar:</span> {app.aadharNo}</p>
                      <p><span className="text-gray-500">GST:</span> {app.gstNo}</p>
                      <p><span className="text-gray-500">CIN:</span> {app.cinNo}</p>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex flex-col gap-2">
                      <a
                        href={app.photoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-3 w-3" /> User Photo
                      </a>
                      <a
                        href={app.lightbillUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-3 w-3" /> Lightbill
                      </a>
                    </div>
                  </td>
                  <td className="py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        app.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : app.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="py-4">
                    {app.status === "pending" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateStatus(app._id, "approved")}
                          disabled={updateStatusMutation.isPending}
                          className="p-1 rounded-md text-green-600 hover:bg-green-50 transition-colors"
                          title="Approve"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(app._id, "rejected")}
                          disabled={updateStatusMutation.isPending}
                          className="p-1 rounded-md text-red-600 hover:bg-red-50 transition-colors"
                          title="Reject"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Action taken</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!pagination.hasPrevPage}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!pagination.hasNextPage}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </Card>
  );
}
