import React from "react";
import {
  DollarSign,
  Euro,
  PoundSterling,
  IndianRupee,
  Banknote,
} from "lucide-react";

export const getInlineUrl = (url: string) =>
  `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=false`;

export const getListingStatusColor = (status?: string) => {
  if (!status) return "bg-gray-100 text-gray-700 hover:bg-gray-100";

  switch (status.toLowerCase()) {
    case "active":
      return "bg-emerald-100 text-emerald-800 hover:bg-emerald-100";
    case "pending":
      return "bg-amber-100 text-amber-800 hover:bg-amber-100";
    case "closed":
      return "bg-slate-100 text-slate-800 hover:bg-slate-100";
    case "rejected":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    case "draft":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  }
};

export const getApplicationStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "reviewed":
      return "bg-blue-100 text-blue-800";
    case "shortlisted":
      return "bg-indigo-100 text-indigo-800";
    case "interview":
      return "bg-purple-100 text-purple-800";
    case "offered":
      return "bg-green-100 text-green-800";
    case "accepted":
      return "bg-emerald-100 text-emerald-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "withdrawn":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const formatLocation = (location: any) => {
  if (!location) return "Location Not Specified";
  if (typeof location === "string") return location;

  const parts = [];
  if (location.city) parts.push(location.city);
  if (location.state) parts.push(location.state);
  if (location.country) parts.push(location.country);

  let locationStr = parts.join(", ");
  if (location.remote) {
    locationStr = locationStr ? `${locationStr} (Remote)` : "Remote";
  }

  return locationStr || "Location Not Specified";
};

export const getCurrencyIcon = (
  currency?: string,
  className: string = "text-muted-foreground h-4 w-4"
) => {
  switch (currency?.toUpperCase()) {
    case "USD":
      return React.createElement(DollarSign, { className });
    case "EUR":
      return React.createElement(Euro, { className });
    case "GBP":
      return React.createElement(PoundSterling, { className });
    case "INR":
      return React.createElement(IndianRupee, { className });
    default:
      return React.createElement(Banknote, { className });
  }
};

export const getCurrencySymbol = (currency?: string) => {
  switch (currency?.toUpperCase()) {
    case "USD":
      return "$";
    case "EUR":
      return "€";
    case "GBP":
      return "£";
    case "INR":
      return "₹";
    default:
      return "";
  }
};
