"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { applicationService } from "@/lib/services/application.service";
import {
  FileText,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  MoreVertical,
  Briefcase,
  GraduationCap,
  Users,
  Search,
  ChevronDown,
  Star,
  Award,
  Video,
  X,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    reviewed: "bg-blue-100 text-blue-800 border-blue-200",
    shortlisted: "bg-indigo-100 text-indigo-800 border-indigo-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
    interview: "bg-purple-100 text-purple-800 border-purple-200",
    offered: "bg-emerald-100 text-emerald-800 border-emerald-200",
    accepted: "bg-green-100 text-green-800 border-green-200",
    withdrawn: "bg-gray-100 text-gray-800 border-gray-200",
  };

  const currentStyle = styles[status as keyof typeof styles] || styles.pending;

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold border ${currentStyle} capitalize shrink-0`}
    >
      {status}
    </span>
  );
};

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
};

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const jobId = params.jobId as string;

  const [selectedApplication, setSelectedApplication] = useState<string | null>(
    null,
  );
  const [interviewDate, setInterviewDate] = useState("");
  const [note, setNote] = useState("");
  const [filter, setFilter] = useState("all");

  const { data: applicantsInfo, isLoading } = useQuery({
    queryKey: ["job-applicants", jobId],
    queryFn: () => applicationService.getJobApplicants(jobId),
    enabled: !!jobId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      noteText,
    }: {
      id: string;
      status: string;
      noteText?: string;
    }) => {
      return applicationService.updateApplicationStatus(id, status, noteText);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-applicants", jobId] });
      setSelectedApplication(null);
      setInterviewDate("");
      setNote("");
    },
  });

  const handleStatusChange = (
    applicationId: string,
    status: string,
    customNote?: string,
  ) => {
    updateStatusMutation.mutate({
      id: applicationId,
      status,
      noteText: customNote || note,
    });
  };

  const scheduleInterview = (applicationId: string) => {
    if (!interviewDate) {
      alert("Please select a date and time for the interview");
      return;
    }
    const formattedDate = format(
      new Date(interviewDate),
      "MMM do, yyyy 'at' h:mm a",
    );
    const interviewNote = `Interview scheduled for ${formattedDate}${note ? ` - ${note}` : ""}`;

    handleStatusChange(applicationId, "interview", interviewNote);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center bg-gray-50/50">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-100 border-t-indigo-600"></div>
        </div>
      </div>
    );
  }

  const applications = applicantsInfo?.data || [];

  const stats = {
    total: applications.length,
    shortlisted: applications.filter((a: any) => a.status === "shortlisted")
      .length,
    interviewing: applications.filter((a: any) => a.status === "interview")
      .length,
    rejected: applications.filter((a: any) => a.status === "rejected").length,
  };

  const filteredApplications = applications.filter((app: any) => {
    if (filter === "all") return true;
    return app.status === filter;
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F8FAFC]">
      {/* Top Banner & Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
          <button
            onClick={() => router.back()}
            className="text-gray-500 hover:text-indigo-600 transition-colors text-sm font-medium flex items-center gap-1.5 mb-6 focus:outline-none group"
          >
            <span className="transform group-hover:-translate-x-1 transition-transform inline-block">
              &larr;
            </span>
            Back to Jobs
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Briefcase className="w-6 h-6 text-indigo-600" />
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  Applicant Tracking
                </h1>
              </div>
              <p className="text-gray-500 mt-1 max-w-xl">
                Review, shortlist, and manage candidates smoothly from your
                dashboard.
              </p>
            </div>

            {applications.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium text-sm cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="interview">Interviewing</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            )}
          </div>

          {/* Stats Row */}
          {applications.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-4 flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                    Total
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                </div>
              </div>
              <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-4 flex items-center gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                    Shortlisted
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.shortlisted}
                  </p>
                </div>
              </div>
              <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-4 flex items-center gap-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                    Interviewing
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.interviewing}
                  </p>
                </div>
              </div>
              <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-4 flex items-center gap-4">
                <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                    Rejected
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.rejected}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
        {applications.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100 flex flex-col items-center justify-center mt-4">
            <div className="bg-indigo-50 p-6 rounded-full mb-6">
              <Users className="w-12 h-12 text-indigo-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No applicants yet
            </h3>
            <p className="text-gray-500 max-w-md mx-auto text-lg leading-relaxed">
              This job hasn't received any applications. Check back later or try
              promoting your job listing to reach more candidates.
            </p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100 flex flex-col items-center justify-center mt-4">
            <div className="bg-gray-50 p-6 rounded-full mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No matches found
            </h3>
            <p className="text-gray-500 max-w-md mx-auto text-lg">
              No applicants match the current status filter. Try changing the
              filter to see other candidates.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredApplications.map((app: any) => {
              const seeker = app.jobSeeker;
              const isSelected = selectedApplication === app._id;
              const initials = getInitials(seeker.firstName, seeker.lastName);

              return (
                <div
                  key={app._id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
                >
                  <div className="p-6 md:p-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                      {/* Avatar and Main Info */}
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row gap-5 items-start">
                          <div className="w-16 h-16 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-inner shrink-0 ring-4 ring-indigo-50">
                            {initials}
                          </div>

                          <div className="flex-1 w-full">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                                {seeker.firstName} {seeker.lastName}
                              </h2>
                              <StatusBadge status={app.status} />
                            </div>

                            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-600 font-medium">
                              <a
                                href={`mailto:${seeker.email}`}
                                className="flex items-center gap-2 hover:text-indigo-600 transition-colors group/link"
                              >
                                <Mail className="w-4 h-4 text-gray-400 group-hover/link:text-indigo-500" />
                                {seeker.email}
                              </a>
                              {seeker.phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-gray-400" />
                                  {seeker.phone}
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-gray-500">
                                <Clock className="w-4 h-4 text-gray-400" />
                                Applied{" "}
                                {formatDistanceToNow(new Date(app.createdAt), {
                                  addSuffix: true,
                                })}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Experience and Skills */}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                          {seeker.skills && seeker.skills.length > 0 && (
                            <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-100">
                              <div className="flex items-center gap-2 mb-3 text-gray-900 font-semibold">
                                <Award className="w-4 h-4 text-indigo-500" />
                                <h4>Key Skills</h4>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {seeker.skills
                                  .slice(0, 6)
                                  .map((skill: string, i: number) => (
                                    <span
                                      key={i}
                                      className="px-3 py-1.5 bg-white text-gray-700 rounded-lg text-sm font-medium border border-gray-200 shadow-sm"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                {seeker.skills.length > 6 && (
                                  <span className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium border border-gray-200">
                                    +{seeker.skills.length - 6} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {(app.resume || app.coverLetter) && (
                            <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-100 flex flex-col justify-center">
                              <div className="flex items-center gap-2 mb-3 text-gray-900 font-semibold">
                                <FileText className="w-4 h-4 text-blue-500" />
                                <h4>Documents</h4>
                              </div>
                              <div className="flex flex-wrap gap-3">
                                {app.resume && (
                                  <a
                                    href={app.resume}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 rounded-lg text-sm font-semibold transition-all shadow-sm group/btn"
                                  >
                                    <FileText className="w-4 h-4 text-indigo-400 group-hover/btn:text-indigo-600" />
                                    View Resume
                                  </a>
                                )}
                                {app.coverLetter && (
                                  <button
                                    onClick={() =>
                                      alert(
                                        "Cover Letter: \n\n" + app.coverLetter,
                                      )
                                    }
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-lg text-sm font-semibold transition-all shadow-sm group/btn"
                                  >
                                    <FileText className="w-4 h-4 text-gray-400 group-hover/btn:text-gray-600" />
                                    Cover Letter
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Status History */}
                        {app.statusHistory && app.statusHistory.length > 0 && (
                          <div className="mt-6 flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-4 py-2.5 rounded-lg w-fit border border-gray-100">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-700">
                              Last activity:
                            </span>
                            <span>
                              {app.statusHistory[app.statusHistory.length - 1]
                                .note || `Status marked as ${app.status}`}
                            </span>
                            <span className="mx-1">•</span>
                            <span>
                              {format(
                                new Date(
                                  app.statusHistory[
                                    app.statusHistory.length - 1
                                  ].changedAt,
                                ),
                                "MMM d, h:mm a",
                              )}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Side Action Panel */}
                      <div className="w-full lg:w-72 shrink-0">
                        <div className="bg-white ring-1 ring-gray-100 rounded-xl p-5 shadow-sm h-full flex flex-col">
                          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <span>Update Status</span>
                          </h4>

                          <div className="space-y-2.5 grow">
                            <button
                              onClick={() =>
                                handleStatusChange(
                                  app._id,
                                  "shortlisted",
                                  "Candidate has been shortlisted",
                                )
                              }
                              className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 hover:border-indigo-500 hover:shadow-sm hover:text-indigo-700 text-gray-700 rounded-lg text-sm font-semibold transition-all group/action"
                            >
                              <span>Shortlist candidate</span>
                              <Star className="w-4 h-4 text-gray-400 group-hover/action:text-indigo-500" />
                            </button>

                            <button
                              onClick={() => setSelectedApplication(app._id)}
                              className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 hover:border-purple-500 hover:shadow-sm hover:text-purple-700 text-gray-700 rounded-lg text-sm font-semibold transition-all group/action"
                            >
                              <span>Schedule Interview</span>
                              <Calendar className="w-4 h-4 text-gray-400 group-hover/action:text-purple-500" />
                            </button>

                            <hr className="my-2 border-gray-100" />

                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    "Confirm offering the position to this candidate?",
                                  )
                                ) {
                                  handleStatusChange(
                                    app._id,
                                    "offered",
                                    "Offer letter sent to candidate",
                                  );
                                }
                              }}
                              className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 hover:border-emerald-500 hover:shadow-sm hover:text-emerald-700 text-gray-700 rounded-lg text-sm font-semibold transition-all group/action"
                            >
                              <span>Make Offer</span>
                              <Award className="w-4 h-4 text-gray-400 group-hover/action:text-emerald-500" />
                            </button>

                            <button
                              onClick={() =>
                                handleStatusChange(
                                  app._id,
                                  "accepted",
                                  "Offer accepted by candidate",
                                )
                              }
                              className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 hover:border-green-500 hover:shadow-sm hover:text-green-700 text-gray-700 rounded-lg text-sm font-semibold transition-all group/action"
                            >
                              <span>Hire & Accept</span>
                              <CheckCircle className="w-4 h-4 text-gray-400 group-hover/action:text-green-500" />
                            </button>

                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    "Are you sure you want to reject this candidate?",
                                  )
                                ) {
                                  handleStatusChange(
                                    app._id,
                                    "rejected",
                                    "Candidate rejected",
                                  );
                                }
                              }}
                              className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 hover:border-red-500 hover:bg-red-50 hover:text-red-700 text-gray-700 rounded-lg text-sm font-semibold transition-all group/action mt-4"
                            >
                              <span>Reject</span>
                              <XCircle className="w-4 h-4 text-gray-400 group-hover/action:text-red-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Interview Scheduling Modal */}
      {selectedApplication &&
        (() => {
          const app = filteredApplications.find(
            (a: any) => a._id === selectedApplication,
          );
          if (!app) return null;

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
                onClick={() => setSelectedApplication(null)}
              ></div>
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 relative z-10">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    Schedule Interview
                  </h3>
                  <button
                    onClick={() => setSelectedApplication(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-600 mb-5">
                    Set a date and time for your interview with{" "}
                    <span className="font-semibold text-gray-900">
                      {app.jobSeeker.firstName} {app.jobSeeker.lastName}
                    </span>
                    .
                  </p>

                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={interviewDate}
                    min={new Date(
                      new Date().getTime() -
                        new Date().getTimezoneOffset() * 60000,
                    )
                      .toISOString()
                      .slice(0, 16)}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg p-3 mb-5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none shadow-sm transition-all bg-white"
                  />

                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                    Note{" "}
                    <span className="text-gray-400 font-normal normal-case">
                      (Optional)
                    </span>
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Technical round via Google Meet"
                    className="w-full text-sm border border-gray-300 rounded-lg p-3 mb-6 min-h-[100px] focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none shadow-sm transition-all bg-white"
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedApplication(null)}
                      className="flex-1 bg-white border border-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => scheduleInterview(app._id)}
                      disabled={updateStatusMutation.isPending}
                      className="flex-1 bg-purple-600 text-white py-2.5 rounded-lg text-sm font-bold shadow-sm hover:bg-purple-700 hover:shadow transition-all disabled:opacity-50 flex justify-center items-center"
                    >
                      {updateStatusMutation.isPending ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        "Schedule"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
};

export default Page;
