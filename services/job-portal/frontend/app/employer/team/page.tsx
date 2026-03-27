"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeService } from "@/lib/services/employee.service";
import { Trash2, UserPlus, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useState } from "react";

interface Employee {
  _id: string;
  company: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  role: string;
  isActive: boolean;
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

export default function EmployeesPage() {
  const queryClient = useQueryClient();

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const { data: employees = [], isLoading, isError } = useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: () => employeeService.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => employeeService.delete(id),
    onMutate: async (id) => {
      setDeletingId(id);
      await queryClient.cancelQueries({ queryKey: ["employees"] });
      const previous = queryClient.getQueryData<Employee[]>(["employees"]);
      queryClient.setQueryData<Employee[]>(["employees"], (old) =>
        old?.filter((e) => e._id !== id)
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      queryClient.setQueryData(["employees"], context?.previous);
      toast.error("Failed to remove employee");
    },
    onSuccess: () => toast.success("Employee removed successfully"),
    onSettled: () => {
      setDeletingId(null);
      setConfirmId(null);
    },
  });

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white border border-slate-100 rounded-xl px-10 py-8 shadow-sm text-center">
          <Loader2 className="animate-spin text-indigo-500 mx-auto" size={28} />
          <p className="text-sm text-slate-500 mt-3">
            Loading team members…
          </p>
        </div>
      </div>
    );

  if (isError)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white border-l-4 border-rose-500 border rounded-xl px-10 py-8 shadow-sm text-center">
          <p className="text-rose-500 font-semibold">
            Unable to load employees
          </p>
          <p className="text-sm text-slate-400 mt-1">
            Please refresh the page or try again later.
          </p>
        </div>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-6 pt-12 pb-20 font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-start gap-4 mb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-500 text-[11px] font-semibold uppercase tracking-[0.08em]">
            <Users size={13} />
            <span>People & Access</span>
          </div>

          <h1 className="text-[26px] font-semibold text-slate-900 tracking-tight font-serif">
            Team Management
          </h1>

          <p className="text-sm text-slate-400">
            Manage your company's team members, roles, and permissions.
          </p>
        </div>

        <Link href="/employer/employees/new">
          <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-md hover:shadow-xl transition-all duration-200">
            <UserPlus size={15} />
            Add Employee
          </button>
        </Link>
      </div>

      {/* Stats */}
      <div className="flex bg-white border border-slate-100 rounded-xl shadow-sm mb-6">
        <Stat label="Total Members" value={employees.length} />
        <Divider />
        <Stat label="Active" value={employees.filter(e => e.isActive).length} />
        <Divider />
        <Stat
          label="Roles"
          value={[...new Set(employees.map(e => e.role))].length}
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.05)] overflow-hidden">
        {employees.length === 0 ? (
          <div className="flex flex-col items-center text-center py-20 px-6">
            <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
              <Users size={26} className="text-indigo-300" />
            </div>
            <p className="font-semibold text-slate-900">
              No team members yet
            </p>
            <p className="text-sm text-slate-400 mt-1 max-w-xs">
              Add your first employee to start managing your team.
            </p>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-5 py-3 text-left text-[11px] uppercase tracking-[0.06em] text-slate-400">
                  Employee
                </th>
                <th className="px-5 py-3 text-left text-[11px] uppercase tracking-[0.06em] text-slate-400">
                  Role
                </th>
                <th className="px-5 py-3 text-left text-[11px] uppercase tracking-[0.06em] text-slate-400">
                  Status
                </th>
                <th className="px-5 py-3 text-right text-[11px] uppercase tracking-[0.06em] text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {employees.map((emp) => {
                const isConfirming = confirmId === emp._id;
                const isDeleting = deletingId === emp._id;

                return (
                  <tr
                    key={emp._id}
                    className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
                          {getInitials(emp.user.firstName, emp.user.lastName)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {emp.user.firstName} {emp.user.lastName}
                          </p>
                          <p className="text-xs text-slate-400">
                            {emp.user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600 capitalize">
                      {emp.role}
                    </td>

                    <td className="px-5 py-4 text-sm font-medium">
                      <span
                        className={
                          emp.isActive
                            ? "text-green-600"
                            : "text-slate-400"
                        }
                      >
                        {emp.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      {isConfirming ? (
                        <div className="flex justify-end items-center gap-2 text-xs">
                          <span className="text-slate-500">
                            Remove?
                          </span>
                          <button
                            onClick={() =>
                              deleteMutation.mutate(emp._id)
                            }
                            disabled={isDeleting}
                            className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1 rounded-md font-semibold transition"
                          >
                            {isDeleting ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              "Yes"
                            )}
                          </button>
                          <button
                            onClick={() => setConfirmId(null)}
                            className="border border-slate-200 px-3 py-1 rounded-md text-slate-600 hover:bg-slate-100 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmId(emp._id)}
                          className="w-8 h-8 rounded-md border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {employees.length > 0 && (
        <p className="text-center text-xs text-slate-300 mt-4">
          {employees.length} member
          {employees.length !== 1 ? "s" : ""} in your organization
        </p>
      )}
    </div>
  );
}

/* Small reusable components */

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex-1 text-center py-5">
      <p className="text-2xl font-semibold text-slate-900 font-serif">
        {value}
      </p>
      <p className="text-[11px] uppercase tracking-[0.06em] text-slate-400 font-medium">
        {label}
      </p>
    </div>
  );
}

function Divider() {
  return <div className="w-px bg-slate-100" />;
}