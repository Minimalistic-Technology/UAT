import mongoose, {
  Document,
  Schema,
  SchemaDefinition,
  SchemaDefinitionType,
} from "mongoose";

export enum JobType {
  FULL_TIME = "full_time",
  PART_TIME = "part_time",
  CONTRACT = "contract",
  INTERNSHIP = "internship",
  FREELANCE = "freelance",
}

export enum ExperienceLevel {
  ENTRY = "entry",
  INTERMEDIATE = "intermediate",
  SENIOR = "senior",
  EXPERT = "expert",
}

export enum JobStatus {
  ACTIVE = "active",
  CLOSED = "closed",
  PENDING = "pending",
  REJECTED = "rejected",
}

export enum WorkMode {
  WORKFROMOFFICE = "work from office",
  REMOTE = "remote",
  HYBRID = "hybrid",
  TEMPWFH = "temporary work from home",
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

// Degree level — used to express the minimum bar
export enum DegreeLevel {
  HIGH_SCHOOL = "high_school",
  DIPLOMA = "diploma",
  BACHELORS = "bachelors",
  MASTERS = "masters",
  PHD = "phd",
  ANY = "any", // no hard requirement
}

export interface IEducation {
  minimumDegree: DegreeLevel;
  preferredFields?: string[]; // e.g. ['Computer Science', 'Information Technology']
  isRequired: boolean; // false = preferred but not mandatory
}

export interface ILocation {
  city: string;
  state: string;
  country: string;
}

export interface IBaseJob extends Document {
  title: string;
  description: string;
  company: mongoose.Types.ObjectId;
  postedBy: mongoose.Types.ObjectId;
  jobType: JobType;
  workMode: WorkMode;
  companyType: CompanyType;
  roleCategory: RoleCategory;
  industry: Industry;
  location: ILocation;
  education: IEducation;
  skills: string[];
  requirements: string[];
  benefits?: string[];
  applicationDeadline?: Date;
  openings: number;
  status: JobStatus;
  isFeatured: boolean;
  applicationsCount: number;
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export const baseJobSchemaDefinition: SchemaDefinition<
  SchemaDefinitionType<IBaseJob>
> = {
  title: {
    type: String,
    required: [true, "Job title is required"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Job description is required"],
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  postedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  jobType: {
    type: String,
    enum: Object.values(JobType),
    required: true,
  },
  workMode: {
    type: String,
    enum: Object.values(WorkMode),
    required: true,
  },
  companyType: {
    type: String,
    enum: Object.values(CompanyType),
    required: true,
  },
  location: {
    city: String,
    state: String,
    country: String,
  },
  skills: [String],
  requirements: [String],
  benefits: [String],
  applicationDeadline: Date,
  openings: {
    type: Number,
    default: 1,
  },
  status: {
    type: String,
    enum: Object.values(JobStatus),
    default: JobStatus.ACTIVE,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  applicationsCount: {
    type: Number,
    default: 0,
  },
  viewsCount: {
    type: Number,
    default: 0,
  },
  roleCategory: {
    type: String,
    enum: Object.values(RoleCategory),
    required: true,
  },
  industry: {
    type: String,
    enum: Object.values(Industry),
    required: true,
  },
  education: {
    minimumDegree: {
      type: String,
      enum: Object.values(DegreeLevel),
      default: DegreeLevel.ANY,
    },
    preferredFields: {
      type: [String],
      default: [],
    },
    isRequired: {
      type: Boolean,
      default: false,
    },
  },
};
