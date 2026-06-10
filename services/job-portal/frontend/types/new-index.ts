import {
  ApplicationStatus,
  CompanyType,
  CouponType,
  DegreeLevel,
  ExperienceLevel,
  GlobalRole,
  Industry,
  InternshipDurationType,
  JobStatus,
  EmploymentType,
  KycStatus,
  ListingType,
  PaymentMethod,
  PaymentStatus,
  RoleCategory,
  StipendType,
  WorkMode,
} from "./enums";

export type CloudinaryAsset = {
  url: string;
  publicId: string;
};

export type ProfessionalExperience = {
  title: string;
  company: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description?: string;
};

export type UserEducationDetails = {
  degree: string;
  institution: string;
  graduationYear: number;
  fieldOfStudy: string;
};

export type Location = {
  city: string;
  state: string;
  country: string;
};

export type JobEducationRequirement = {
  minimumDegree: DegreeLevel;
  preferredFields?: string[];
  isRequired: boolean;
};

export type SalaryDetails = {

  min?: number;
  max?: number;
  currency: string;
  period: "hourly" | "monthly" | "yearly";
};

export type StipendDetails = {
  type: StipendType;
  amount?: number;
  currency: string;
  period: "monthly" | "weekly";
};

export type CompanyLocation = Location & {
  address: string;
  zipCode: string;
};

export type CompanySocialLinks = {
  inkedin?: string;
  twitter?: string;
  facebook?: string;
};

export type WebhookPaymentsEvent = {
  eventId?: string;
  type?: string;
  receivedAt: Date;
};

export type ApplicationStatusHistory = {
  status: ApplicationStatus;
  changedAt: Date;
  changedBy?: string; // mongoose.objectId
  note?: string;
};

export type Pagination = {
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type User = {
  _id: string; // mongoose.objectId
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone?: string;
  phoneVerified: boolean;
  role: GlobalRole;
  avatar?: CloudinaryAsset;
  resume?: CloudinaryAsset;
  resumeOriginalName?: string;
  skills?: string[];
  languages?: string[];
  experience?: ProfessionalExperience[];
  education?: UserEducationDetails[];
  location?: Location;
  company?: string; // mongoose.objectId
  googleId?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type BaseListing = {
  title: string;
  description: string;
  company: string; // mongoose.objectId
  postedBy: string; // mongoose.objectId
  employmentType: EmploymentType;
  workMode: WorkMode;
  companyType: CompanyType;
  roleCategory: RoleCategory;
  industry: Industry;
  location?: Location;
  education: JobEducationRequirement;
  skills: string[];
  requirements: string[];
  benefits?: string[];
  applicationDeadline?: Date;
  openings: number;
  status: JobStatus;
  isFeatured: boolean;
  applicationsCount: number;
  viewsCount: number;
  opportunityType: ListingType
};

export type Job = BaseListing & {
  _id: string; // mongoose.objectId
  experienceLevel: ExperienceLevel;
  experienceInYears: number;
  salary: SalaryDetails;
  createdAt: Date;
  updatedAt: Date;
};

export type Internship = BaseListing & {
  _id: string; // mongoose.objectId
  stipend: StipendDetails;
  duration: {
    value: number;
    unit: InternshipDurationType;
  };
  isPPO: boolean;
  startDate?: Date;
  certificateProvided: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Kyc = {
  _id: string; // mongoose.objectId
  user: string; // mongoose.objectId
  companyName: string;
  aadharNo: string;
  gstNo: string;
  cinNo: string;
  photo: CloudinaryAsset;
  lightbill: CloudinaryAsset;
  status: KycStatus;
  rejectionReason?: string;
  isLatest: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Plan = {
  _id: string; // mongoose.objectId
  name: string;
  description?: string;
  price: number;
  currency: "INR" | "USD" | "EUR" | "GBP";
  durationDays: number;
  jobPostLimit: number;
  teamMemberLimit: number;
  isFeatured: boolean;
  isDefault: boolean;
  displayOrder: number;
  features: string[];
  isActive: boolean;
  allowResumeDownload: boolean;
  postValidityDays: number;
  createdAt: Date;
  updatedAt: Date;
};

export type Coupon = {
  _id: string; // mongoose.objectId
  code: string;
  type: CouponType;
  value: number;
  isActive: boolean;
  expiryDate?: Date;
  maxUses?: number;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type Company = {
  _id: string; // mongoose.objectId
  name: string;
  description: string;
  logo?: CloudinaryAsset;
  website?: string;
  industry: string;
  companySize: string;
  location: CompanyLocation;
  owner: string; // mongoose.objectId
  socialLinks: CompanySocialLinks;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Payment = {
  _id: string; // mongoose.objectId
  userId: string; // mongoose.objectId
  amount: number; // in paise
  currency: string;

  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;

  webhookEvents: WebhookPaymentsEvent[];

  metadata: Map<string, any>;
  method?: PaymentMethod;

  failureReason?: string;

  refundId?: string;
  refundAmount?: number;

  status: PaymentStatus;
  receipt?: string;

  capturedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
};

export type Application = {
  _id: string; // mongoose.objectId
  listing: string; // mongoose.objectId
  listingType: ListingType;
  jobSeeker: string; // mongoose.objectId
  resume: string;
  coverLetter?: string;

  status: ApplicationStatus;
  statusHistory: ApplicationStatusHistory;
  interviewDate?: Date;
  employerNotes?: string;

  createdAt: Date;
  updatedAt: Date;
};

export type subscription = {
  _id: string; // mongoose.objectId
  employerId: string; // mongoose.objectId
  planId: string; // mongoose.objectId
  companyId: string; // mongoose.objectId
  orderId?: string;
  postsRemaining: number;
  totalPostsGranted: number;
  startDate: Date;
  expiryDate: Date;
  status: "active" | "expired" | "depleted" | "cancelled";
  lastBilledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};
