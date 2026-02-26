import { Card } from "@/components/ui/Card";
import { apiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp } from "lucide-react";

const AnalyticsTab = () => {
  const {data: statsResponse} = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => apiClient.get('/admin/stats'),
    // enabled,
  });

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
            <span className="text-gray-600">Total Applications</span>
            <span className="text-2xl font-bold text-gray-900">
              {/* {stats?.data?.totalApplications || 0} */}
              0
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">This Month</span>
            <span className="text-2xl font-bold text-primary-600">
              {/* {stats?.data?.monthlyApplications || 0} */}
              0
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Success Rate</span>
            <span className="text-2xl font-bold text-green-600">
              {/* {stats?.data?.successRate || 0}% */}
              0 %
            </span>
          </div>
        </div>
      </Card>
    </>
  );
};

export default AnalyticsTab;
