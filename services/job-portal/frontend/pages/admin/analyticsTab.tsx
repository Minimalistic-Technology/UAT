import { Card } from "@/components/ui/Card";
import { TrendingUp } from "lucide-react";

interface StatsData {
  totalUsers: number;
  totalJobs: number;
  totalCompanies: number;
}

interface AnalyticsTabProps {
  stats?: StatsData;
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ stats }) => {
  const totalUsers = stats?.totalUsers || 0;
  const totalJobs = stats?.totalJobs || 0;
  const totalCompanies = stats?.totalCompanies || 0;

  return (
    <>
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          User Growth
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          <TrendingUp className="w-12 h-12 mb-2" />
          <p>Chart coming soon...</p>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Application Stats
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Total Users</span>
            <span className="text-2xl font-bold text-gray-900">
              {totalUsers}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Total Companies Registered</span>
            <span className="text-2xl font-bold text-gray-900">
              {totalCompanies}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Total Jobs</span>
            <span className="text-2xl font-bold text-gray-900">
              {totalJobs}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Total Applications</span>
            <span className="text-2xl font-bold text-gray-900">
              {/* {stats?.data?.totalApplications || 0} */}0
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">This Month</span>
            <span className="text-2xl font-bold text-primary-600">
              {/* {stats?.data?.monthlyApplications || 0} */}0
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Success Rate</span>
            <span className="text-2xl font-bold text-green-600">
              {/* {stats?.data?.successRate || 0}% */}0 %
            </span>
          </div>
        </div>
      </Card>
    </>
  );
};

export default AnalyticsTab;
