import z from "zod";

export const BaseListingSchema = z.object({});

export const Listing_Status = ["active", "closed", "pending", "rejected"];


export const Job_Type = [
  "full_time",
  "part_time",
  "contract",
  "internship",
  "freelance",
];

export const Work_Mode = [
  "work from office",
  "remote",
  "hybrid",
  "temporary work from home",
];

export const Company_Type = [
  "startup",
  "mnc",
  "foreign mnc",
  "indian mnc",
  "corporate",
  "govt/psu",
  "others",
];

export const Experience_Level = ["entry", "intermediate", "senior", "expert"];

export const ROLE_CATEGORIES = [
  "software_development",
  "data_science",
  "devops",
  "cybersecurity",
  "it_support",
  "qa_testing",
  "hardware",
  "ui_ux",
  "graphic_design",
  "product_design",
  "product_management",
  "project_management",
  "business_analysis",
  "operations",
  "consulting",
  "sales",
  "digital_marketing",
  "content",
  "seo_sem",
  "brand_management",
  "finance",
  "accounting",
  "legal",
  "compliance",
  "human_resources",
  "recruitment",
  "administration",
  "customer_support",
  "research",
  "other",
];

export const INDUSTRIES = [
  "information_technology",
  "software",
  "ecommerce",
  "fintech",
  "edtech",
  "healthtech",
  "banking",
  "insurance",
  "healthcare",
  "education",
  "manufacturing",
  "retail",
  "real_estate",
  "logistics",
  "automotive",
  "energy",
  "telecom",
  "media",
  "entertainment",
  "hospitality",
  "agriculture",
  "government",
  "nonprofit",
  "other",
];

export const Degree_Level = [
  "high_school",
  "diploma",
  "bachelors",
  "masters",
  "phd",
  "any",
];