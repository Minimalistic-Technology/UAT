export enum CompanyRole {
  OWNER = "owner",
  ADMIN = "admin",
  RECRUITER = "recruiter",
  HR = "hr",
}

export enum StipendType {
  FIXED = "fixed",
  PERFORMANCE_BASED = "performance_based",
  UNPAID = "unpaid",
}

export enum DurationType {
  WEEKS = "weeks",
  MONTHS = "months",
}

export enum WorkMode {
  WORKFROMOFFICE = "work from office",
  REMOTE = "remote",
  HYBRID = "hybrid",
  TEMPWFH = "temporary work from home",
}

export enum GlobalRole {
  SUPER_ADMIN = "super_admin",
  USER = "user",
}

export enum RoleCategory {
  // Engineering & Tech
  SOFTWARE_DEVELOPMENT = "software_development",
  DATA_SCIENCE = "data_science",
  DEVOPS = "devops",
  CYBERSECURITY = "cybersecurity",
  IT_SUPPORT = "it_support",
  QA_TESTING = "qa_testing",
  HARDWARE = "hardware",

  // Design
  UI_UX = "ui_ux",
  GRAPHIC_DESIGN = "graphic_design",
  PRODUCT_DESIGN = "product_design",

  // Business & Management
  PRODUCT_MANAGEMENT = "product_management",
  PROJECT_MANAGEMENT = "project_management",
  BUSINESS_ANALYSIS = "business_analysis",
  OPERATIONS = "operations",
  CONSULTING = "consulting",

  // Sales & Marketing
  SALES = "sales",
  DIGITAL_MARKETING = "digital_marketing",
  CONTENT = "content",
  SEO_SEM = "seo_sem",
  BRAND_MANAGEMENT = "brand_management",

  // Finance & Legal
  FINANCE = "finance",
  ACCOUNTING = "accounting",
  LEGAL = "legal",
  COMPLIANCE = "compliance",

  // HR & Admin
  HUMAN_RESOURCES = "human_resources",
  RECRUITMENT = "recruitment",
  ADMINISTRATION = "administration",

  // Other
  CUSTOMER_SUPPORT = "customer_support",
  RESEARCH = "research",
  OTHER = "other",
}

export enum Industry {
  // Tech
  INFORMATION_TECHNOLOGY = "information_technology",
  SOFTWARE = "software",
  ECOMMERCE = "ecommerce",
  FINTECH = "fintech",
  EDTECH = "edtech",
  HEALTHTECH = "healthtech",

  // Traditional sectors
  BANKING = "banking",
  INSURANCE = "insurance",
  HEALTHCARE = "healthcare",
  EDUCATION = "education",
  MANUFACTURING = "manufacturing",
  RETAIL = "retail",
  REAL_ESTATE = "real_estate",
  LOGISTICS = "logistics",
  AUTOMOTIVE = "automotive",
  ENERGY = "energy",
  TELECOM = "telecom",
  MEDIA = "media",
  ENTERTAINMENT = "entertainment",
  HOSPITALITY = "hospitality",
  AGRICULTURE = "agriculture",
  GOVERNMENT = "government",
  NONPROFIT = "nonprofit",
  OTHER = "other",
}

export enum ListingType {
  JOB = "job",
  INTERNSHIP = "internship",
}

export enum PaymentMethod {
  CARD = "card",
  UPI = "upi",
  NET_BANKING = "net banking",
  WALLET = "wallet",
}

export enum InternshipDurationType {
  WEEKS = "weeks",
  MONTHS = "months",
}

export enum KycStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export enum CouponType {
  PERCENTAGE = "percentage",
  AMOUNT = "amount",
}

export enum CompanyType {
  STARTUP = "startup",
  MNC = "mnc",
  FOREIGN_MNC = "foreign mnc",
  INDIAN_MNC = "indian mnc",
  CORPORATE = "corporate",
  "GOVT/PSU" = "govt/psu",
  OTHERS = "others",
}

export enum DegreeLevel {
  HIGH_SCHOOL = "high_school",
  DIPLOMA = "diploma",
  BACHELORS = "bachelors",
  MASTERS = "masters",
  PHD = "phd",
  ANY = "any", // no hard requirement
}

export enum ApplicationStatus {
  PENDING = "pending",
  REVIEWED = "reviewed",
  SHORTLISTED = "shortlisted",
  REJECTED = "rejected",
  INTERVIEW = "interview",
  OFFERED = "offered",
  ACCEPTED = "accepted",
  WITHDRAWN = "withdrawn",
}

export enum SubscriptionStatus {
  ACTIVE = "active",
  EXPIRED = "expired",
  DEPLETED = "depleted",
  CANCELLED = "cancelled",
}

export enum ExperienceLevel {
  ENTRY = "entry",
  INTERMEDIATE = "intermediate",
  SENIOR = "senior",
  EXPERT = "expert",
}

export enum OpportunityType {
  JOB = "job",
  INTERNSHIP = "internship",
}

export enum EmploymentType {
  FULL_TIME = "full_time",
  PART_TIME = "part_time",
  CONTRACT = "contract",
  INTERNSHIP = "internship",
  FREELANCE = "freelance",
}

export enum PaymentStatus {
  CREATED = "created",
  AUTHORIZED = "authorized",
  CAPTURED = "captured",
  FAILED = "failed",
  REFUNDED = "refunded",
}

export enum JobStatus {
  ACTIVE = "active",
  CLOSED = "closed",
  PENDING = "pending",
  REJECTED = "rejected",
}
