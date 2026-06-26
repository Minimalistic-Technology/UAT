import React from "react";
import { AlertCircle } from "lucide-react";

interface DashboardErrorProps {
  title?: string;
  message?: string;
}

export const DashboardError: React.FC<DashboardErrorProps> = ({
  title = "Failed to load payload",
  message = "An error occurred while fetching the data.",
}) => {
  return (
    <div className="text-destructive flex h-96 flex-col items-center justify-center">
      <AlertCircle className="mb-4 size-8 opacity-50" />
      <p className="text-lg font-semibold">{title}</p>
      <p className="text-sm opacity-80">{message}</p>
    </div>
  );
};
