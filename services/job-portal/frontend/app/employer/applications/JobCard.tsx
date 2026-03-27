"use client";

import {
  MapPin,
  Briefcase,
  IndianRupee,
  Clock,
  Users,
  Eye,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

interface JobData {
  _id: string;
  title: string;
  description: string;
  company: {
    _id: string;
    name: string;
  };
  location: {
    city: string;
    country: string;
    remote: boolean;
  };
  salary: {
    min: number;
    max: number;
    currency: string;
    period: string;
  };
  postedBy: string;
  jobType: string;
  experienceLevel: string;
  skills: string[];
  requirements: string[];
  benefits: string[];
  openings: number;
  status: string;
  isFeatured: boolean;
  applicationsCount: number;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
}

export const JobCard = ({ job }: { job: JobData }) => {
  const isJobActive = job.status === "active";
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/employer/applications/${job._id}`)}
      className="p-4 hover:shadow-lg transition-all duration-300 border border-gray-200 flex flex-col h-full bg-white group cursor-pointer"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
            {job.title}
          </h3>
          <p className="text-gray-600 font-medium text-sm">
            {job.company?.name || "Company Name"}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${isJobActive ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-700 border-gray-200"}`}
          >
            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
          </span>
          {job.isFeatured && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Featured
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-4 mb-6 text-sm text-gray-600 grow">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="truncate">
            {job.location.city}, {job.location.country}{" "}
            {job.location.remote && "(Remote)"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="capitalize">
            {job.jobType.replace("_", " ")} • {job.experienceLevel}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <IndianRupee className="w-4 h-4 text-gray-400 shrink-0" />
          <span>
            {job.salary.min.toLocaleString()} -{" "}
            {job.salary.max.toLocaleString()} {job.salary.currency}/
            {job.salary.period === "yearly" ? "yr" : "mo"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400 shrink-0" />
          <span>
            Posted{" "}
            {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
        <div className="flex items-center gap-4 text-gray-500">
          <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
            <Users className="w-4 h-4" />
            <span className="font-medium">
              {job.applicationsCount}{" "}
              <span className="hidden sm:inline">Applicants</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-gray-50 text-gray-700 px-2 py-1 rounded-md">
            <Eye className="w-4 h-4" />
            <span className="font-medium">
              {job.viewsCount} <span className="hidden sm:inline">Views</span>
            </span>
          </div>
        </div>
        <span className="text-gray-500 font-medium text-xs bg-gray-100 px-2 py-1 rounded-md">
          {job.openings} opening{job.openings !== 1 && "s"}
        </span>
      </div>
    </div>
  );
};
