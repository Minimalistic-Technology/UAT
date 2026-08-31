import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/apiError.js";
import {
  tokenize,
  buildIdf,
  tfidfVector,
  cosineSimilaritySparse,
  jaccardSimilarity,
} from "../utils/keyword-matcher.js";

// Job recommendation engine — content-based filtering built entirely from
// keyword matching (TF-IDF cosine similarity, Jaccard similarity on skills)
// and structured profile signals (location, experience, past-application
// affinity, recency). No AI/ML models or external calls are involved.

const DEFAULT_RESULT_LIMIT = 10;
const MAX_RESULT_LIMIT = 50;
const CANDIDATE_POOL_SIZE = 300;
const MAX_PER_COMPANY = 2;
const RECENCY_HALF_LIFE_DAYS = 21;

const EXPERIENCE_LEVEL_ORDER: Record<string, number> = {
  ENTRY: 0,
  INTERMEDIATE: 1,
  SENIOR: 2,
  EXPERT: 3,
};

// Weights sum to 1 — each component is normalized to a 0..1 score before being weighted.
const WEIGHTS = {
  skills: 0.32,
  keywords: 0.2,
  roleAffinity: 0.14,
  location: 0.12,
  experience: 0.1,
  behaviorAffinity: 0.06,
  recency: 0.06,
};

type OpportunityType = "JOB" | "INTERNSHIP";

interface RecommendationOptions {
  limit?: number;
  opportunityType?: OpportunityType;
}

function yearsOfExperience(
  experiences: { startDate: Date; endDate: Date | null; current: boolean }[],
): number {
  let totalMonths = 0;
  const now = new Date();

  for (const exp of experiences) {
    const start = new Date(exp.startDate);
    const end = exp.current || !exp.endDate ? now : new Date(exp.endDate);
    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
    totalMonths += Math.max(0, months);
  }

  return totalMonths / 12;
}

function yearsToExperienceLevel(years: number): keyof typeof EXPERIENCE_LEVEL_ORDER {
  if (years < 2) return "ENTRY";
  if (years < 5) return "INTERMEDIATE";
  if (years < 9) return "SENIOR";
  return "EXPERT";
}

/** Counts occurrences of a field's values, returning both the map and the max count for normalization. */
function buildAffinityMap<T extends string>(values: T[]): { counts: Map<T, number>; max: number } {
  const counts = new Map<T, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  const max = Math.max(1, ...counts.values());
  return { counts, max };
}

export async function getRecommendedListings(userId: string, options: RecommendationOptions = {}) {
  const limit = Math.min(MAX_RESULT_LIMIT, Math.max(1, options.limit ?? DEFAULT_RESULT_LIMIT));

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      experiences: true,
      educations: true,
      location: true,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const pastApplications = await prisma.application.findMany({
    where: { jobSeekerId: userId },
    select: {
      listingId: true,
      listing: {
        select: { roleCategory: true, employmentType: true, workMode: true },
      },
    },
  });

  const appliedListingIds = pastApplications.map((app) => app.listingId);

  const roleAffinity = buildAffinityMap(
    pastApplications.map((app) => app.listing?.roleCategory).filter(Boolean) as string[],
  );
  const employmentTypeAffinity = buildAffinityMap(
    pastApplications.map((app) => app.listing?.employmentType).filter(Boolean) as string[],
  );
  const workModeAffinity = buildAffinityMap(
    pastApplications.map((app) => app.listing?.workMode).filter(Boolean) as string[],
  );

  const candidateWhere: Record<string, any> = {
    status: "ACTIVE",
    isDeleted: false,
    OR: [{ applicationDeadline: null }, { applicationDeadline: { gt: new Date() } }],
  };

  if (appliedListingIds.length > 0) {
    candidateWhere.id = { notIn: appliedListingIds };
  }

  if (options.opportunityType) {
    candidateWhere.opportunityType = options.opportunityType;
  }

  // Don't recommend a company's own openings to one of its members.
  const companyMember = await prisma.companyMember.findFirst({ where: { userId } });
  if (companyMember) {
    candidateWhere.companyId = { not: companyMember.companyId };
  }

  const candidates = await prisma.baseListing.findMany({
    where: candidateWhere,
    include: {
      company: {
        select: {
          id: true,
          name: true,
          logo: true,
          industry: true,
          locations: { select: { city: true, state: true, country: true } },
        },
      },
      jobDetails: true,
      internshipDetails: true,
    },
    orderBy: { createdAt: "desc" },
    take: CANDIDATE_POOL_SIZE,
  });

  if (candidates.length === 0) return [];

  // Weight skills 3x heavier than free-text signals in the user's TF-IDF document.
  const userSkillTokens = user.skills.flatMap((skill) => tokenize(skill));
  const userExperienceTokens = user.experiences.flatMap((exp) =>
    tokenize(`${exp.title} ${exp.company}`),
  );
  const userEducationTokens = user.educations.flatMap((edu) =>
    tokenize(`${edu.degree} ${edu.fieldOfStudy}`),
  );
  const userDocTokens = [
    ...userSkillTokens,
    ...userSkillTokens,
    ...userSkillTokens,
    ...userExperienceTokens,
    ...userEducationTokens,
  ];

  const listingDocTokens = candidates.map((listing) =>
    tokenize(
      [
        listing.title,
        listing.skills.join(" "),
        listing.requirements.join(" "),
        listing.roleCategory,
        listing.industry,
      ].join(" "),
    ),
  );

  const idf = buildIdf([userDocTokens, ...listingDocTokens]);
  const userVector = tfidfVector(userDocTokens, idf);

  const userExperienceYears = yearsOfExperience(user.experiences);
  const userExperienceLevel = yearsToExperienceLevel(userExperienceYears);
  const userLocation = user.location;
  const now = Date.now();

  const scored = candidates.map((listing, index) => {
    const listingVector = tfidfVector(listingDocTokens[index], idf);
    const keywordScore = cosineSimilaritySparse(userVector, listingVector);
    const skillScore = jaccardSimilarity(user.skills, listing.skills);

    const roleScore = (roleAffinity.counts.get(listing.roleCategory) ?? 0) / roleAffinity.max;

    let locationScore = 0;
    if (userLocation) {
      if (listing.city && userLocation.city && listing.city.toLowerCase() === userLocation.city.toLowerCase()) {
        locationScore = 1;
      } else if (listing.state && userLocation.state && listing.state.toLowerCase() === userLocation.state.toLowerCase()) {
        locationScore = 0.6;
      } else if (listing.country && userLocation.country && listing.country.toLowerCase() === userLocation.country.toLowerCase()) {
        locationScore = 0.3;
      }
    }
    if (listing.workMode === "REMOTE" || listing.workMode === "TEMPORARY_WFH") {
      locationScore = Math.max(locationScore, 0.7);
    }

    let experienceScore = 0.5; // neutral default (e.g. internships have no job-level detail)
    if (listing.opportunityType === "JOB" && listing.jobDetails) {
      const levelDiff = Math.abs(
        EXPERIENCE_LEVEL_ORDER[listing.jobDetails.experienceLevel] -
          EXPERIENCE_LEVEL_ORDER[userExperienceLevel],
      );
      const levelScore = Math.max(0, 1 - levelDiff * 0.35);
      const yearsDiff = Math.abs(listing.jobDetails.experienceInYears - userExperienceYears);
      const yearsScore = Math.max(0, 1 - yearsDiff / 8);
      experienceScore = (levelScore + yearsScore) / 2;
    }

    const employmentTypeScore =
      (employmentTypeAffinity.counts.get(listing.employmentType) ?? 0) / employmentTypeAffinity.max;
    const workModeScore =
      (workModeAffinity.counts.get(listing.workMode) ?? 0) / workModeAffinity.max;
    const behaviorScore = (employmentTypeScore + workModeScore) / 2;

    const daysSincePosted = (now - listing.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.exp(-daysSincePosted / RECENCY_HALF_LIFE_DAYS);

    const totalScore =
      skillScore * WEIGHTS.skills +
      keywordScore * WEIGHTS.keywords +
      roleScore * WEIGHTS.roleAffinity +
      locationScore * WEIGHTS.location +
      experienceScore * WEIGHTS.experience +
      behaviorScore * WEIGHTS.behaviorAffinity +
      recencyScore * WEIGHTS.recency;

    return { listing, score: totalScore };
  });

  scored.sort((a, b) => b.score - a.score);

  // Diversify results so one company doesn't dominate the list.
  const perCompanyCount = new Map<string, number>();
  const diversified: typeof scored = [];
  const overflow: typeof scored = [];

  for (const item of scored) {
    const count = perCompanyCount.get(item.listing.companyId) ?? 0;
    if (count < MAX_PER_COMPANY) {
      perCompanyCount.set(item.listing.companyId, count + 1);
      diversified.push(item);
    } else {
      overflow.push(item);
    }
    if (diversified.length >= limit) break;
  }

  for (const item of overflow) {
    if (diversified.length >= limit) break;
    diversified.push(item);
  }

  return diversified.map(({ listing, score }) => ({
    ...listing,
    matchScore: Math.round(score * 100),
  }));
}
