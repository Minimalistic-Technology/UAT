export const getInlineUrl = (url: string) =>
  `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=false`;

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
