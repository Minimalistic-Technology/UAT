import Link from "next/link";
import { ArrowRightIcon, MapPinIcon, UsersIcon } from "lucide-react";

interface CompanyCardProps {
  company: {
    _id: string;
    name: string;
    description?: string;
    industry?: string;
    companySize?: string;
    logo?: { url: string };
    location?: {
      city?: string;
      country?: string;
    };
  };
}

export const CompanyCard = ({ company }: CompanyCardProps) => {
  const initials = company.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const location = [company.location?.city, company.location?.country]
    .filter(Boolean)
    .join(", ");

  return (
    <Link
      href={`/companies/${company._id}`}
      className="group block rounded-xl border border-border/40 bg-card p-5 transition-colors hover:border-border"
    >
      <div className="mb-3 flex items-center gap-3">
        {/* Logo / Fallback initials */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/40 bg-muted">
          {company.logo?.url ? (
            <img
              src={company.logo.url}
              alt={`${company.name} logo`}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-muted-foreground text-sm font-medium">
              {initials}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{company.name}</p>
          {company.industry && (
            <p className="text-muted-foreground text-xs capitalize">
              {company.industry.replace(/_/g, " ")}
            </p>
          )}
        </div>

        <ArrowRightIcon className="text-muted-foreground h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
      </div>

      {company.description && (
        <p className="text-muted-foreground mb-3 line-clamp-2 text-sm leading-relaxed">
          {company.description}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {location && (
          <span className="text-muted-foreground bg-muted inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs">
            <MapPinIcon className="h-3 w-3" />
            {location}
          </span>
        )}
        {company.companySize && (
          <span className="text-muted-foreground bg-muted inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs">
            <UsersIcon className="h-3 w-3" />
            {company.companySize} employees
          </span>
        )}
      </div>
    </Link>
  );
};