import { AdminStatusCard as StatusCard  } from "@/features/admin/components/stats-card";
import { Button } from "@/components/ui/button";
import { DollarSign, Plus, Users, Briefcase, ShieldCheck } from "lucide-react";
import Link from "next/link";

const AdminDashboard = () => {
  return (
    <>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Dashboard Overview
          </h1>
          <p className="text-sm text-slate-500">
            Welcome back, Raj. Here's what's happening today.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin-dashboard/coupons/create">Create Coupon</Link>
          </Button>
          <Button
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-600/80"
            asChild
          >
            <Link href="/admin-dashboard/plans/create">
              <Plus className="mr-2 size-4" /> Create Plan
            </Link>
          </Button>
        </div>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatusCard
          label="Total Revenue"
          value="$45,231.89"
          variant="admin"
          icon={<DollarSign />}
          description="+20% vs last month"
        />
        <StatusCard
          label="Active Users"
          value="2,405"
          variant="admin"
          icon={<Users className="text-slate-400" />}
          className="bg-linear-to-tr from-blue-800 to-blue-600"
        />
        <StatusCard
          label="Job Listings"
          value="156"
          variant="admin"
          icon={<Briefcase className="text-slate-400" />}
        />
        <StatusCard
          label="KYC Pending"
          value="12"
          variant="admin"
          icon={<ShieldCheck className="text-slate-400" />}
        />
      </div>

      {/* Main Content Area */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-h-100 rounded-xl border bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="mb-4 font-semibold text-slate-800">Recent Activity</h3>
          {/* Table or Chart goes here */}
          <div className="flex h-64 items-center justify-center rounded-lg border border-dashed text-slate-400">
            Activity Graph Placeholder
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
