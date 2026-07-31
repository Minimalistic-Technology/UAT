import {
  ApplicationStatus,
  CompanyType,
  CouponType,
  DegreeLevel,
  ExperienceLevel,
  GlobalRole,
  Industry,
  JobStatus,
  EmploymentType,
  KycStatus,
  PaymentMethod,
  PaymentStatus,
  RoleCategory,
  StipendType,
  WorkMode,
  WorkType,
  SubscriptionStatus,
  CompanyRole
} from "./enums";

export * from "./enums";

export type CloudinaryAsset = {
  url: string;
  publicId: string;
};

export type Avatar = {
  id: string;
  url: string;
  publicId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Resume = {
  id: string;
  url: string;
  publicId: string;
  originalName?: string;
  userId: string;
  atsScore?: AtsScore;
  createdAt: Date;
  updatedAt: Date;
};

export type AtsScore = {
  id: string;
  overallScore: number;
  sectionScore: number;
  formattingScore: number;
  keywordScore: number;
  contentScore: number;
  sectionsFound: string[];
  sectionsMissing: string[];
  matchedKeywords: string[];
  resumeId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Location = {
  id: string;
  city?: string;
  state?: string;
  country?: string;
  userId: string;
};

export type Experience = {
  id: string;
  title: string;
  company: string;
  workType?: WorkType;
  location?: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description?: string;
  userId: string;
};

export type Education = {
  id: string;
  degree: string;
  institution: string;
  graduationYear: number;
  fieldOfStudy: string;
  userId: string;
};

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone?: string;
  role: GlobalRole;
  avatar?: Avatar;
  resume?: Resume;
  skills: string[];
  languages: string[];
  experiences?: Experience[];
  educations?: Education[];
  location?: Location;
  googleId?: string;
  isActive: boolean;
  isVerified: boolean;
  company?: Company;
  createdAt: Date;
  updatedAt: Date;
};

export type Testimonial = {
  id: string;
  content: string;
  rating: number;
  authorName: string;
  authorRole?: string;
  authorCompany?: string;
  status: string; // TestimonialStatus
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CompanyLocation = {
  id: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  isHeadquarters: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CompanyMember = {
  id: string;
  userId: string;
  companyId: string;
  role: CompanyRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Company = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  website?: string;
  industry: string;
  companySize: string; // CompanySize
  locations?: CompanyLocation[];
  socialLinks?: any; // Json
  ownerId: string;
  isVerified: boolean;
  verifiedAt?: Date;
  logoId?: string;
  logo?: StorageAsset;
  members?: CompanyMember[];
  createdAt: Date;
  updatedAt: Date;
};

export type StorageAsset = {
  id: string;
  url: string;
  publicId: string;
  mimeType?: string;
  sizeBytes?: number;
  createdAt: Date;
  updatedAt: Date;
};

export type Plan = {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string; // Currency
  subscriptionDurationDays: number;
  maxActiveJobPosts: number;
  maxTeamMembers: number;
  jobPostValidityDays: number;
  allowResumeDownload: boolean;
  features: string[];
  isDefault: boolean;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Subscription = {
  id: string;
  companyId: string;
  planId: string;
  plan?: Plan;
  orderId?: string;
  paymentRef?: string;
  postsRemaining: number;
  totalPostsGranted: number;
  startDate: Date;
  expiryDate: Date;
  cancelledAt?: Date;
  lastBilledAt?: Date;
  status: SubscriptionStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type PaymentWebhookEvent = {
  id: string;
  paymentId?: string;
  eventId: string;
  type: string;
  payload: any; // Json
  processedAt?: Date;
  receivedAt: Date;
};

export type Refund = {
  id: string;
  paymentId: string;
  razorpayRefundId: string;
  amount: number;
  reason?: string;
  status: string; // RefundStatus
  createdAt: Date;
  updatedAt: Date;
};

export type Payment = {
  id: string;
  userId: string;
  subscriptionId?: string;
  amount: number;
  currency: string; // Currency
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  webhookEvents?: PaymentWebhookEvent[];
  metadata?: any; // Json
  method?: PaymentMethod;
  failureReason?: string;
  status: PaymentStatus;
  receipt?: string;
  capturedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type Coupon = {
  id: string;
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

export type CouponUsage = {
  id: string;
  couponId: string;
  userId: string;
  paymentId?: string;
  discountApplied: number;
  usedAt: Date;
};

export type KYC = {
  id: string;
  userId: string;
  companyId?: string;
  companyDocumentId: string;
  companyDocumentType: string; // DocumentType
  personalDocumentId: string;
  personalDocumentType: string; // DocumentType
  status: KycStatus;
  rejectionReason?: string;
  reviewedAt?: Date;
  isLatest: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Draft = {
  id: string;
  companyId: string;
  postedById: string;
  type: string; // DraftType
  formData: any; // Json
  createdAt: Date;
  updatedAt: Date;
};

export type BaseListing = {
  id: string;
  title: string;
  description: string;
  companyId: string;
  postedById: string;
  opportunityType: string; // DraftType
  employmentType: EmploymentType;
  experienceLevel?: ExperienceLevel;
  workMode: WorkMode;
  companyType: CompanyType;
  roleCategory: RoleCategory;
  industry: Industry;
  city?: string;
  state?: string;
  country?: string;
  minimumDegree: DegreeLevel;
  preferredFields: string[];
  isDegreeRequired: boolean;
  skills: string[];
  requirements: string[];
  benefits: string[];
  genderPreference: string; // GenderPreference
  englishFluency: string; // EnglishFluency
  applicationDeadline?: Date;
  openings: number;
  status: JobStatus;
  applicationsCount: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Internship = {
  id: string;
  listingId: string;
  listing?: BaseListing;
  stipendType: StipendType;
  stipendAmount?: number;
  stipendCurrency: string; // Currency
  stipendPeriod: string; // StipendPeriod
  durationValue: number;
  durationUnit: string; // DurationUnit
  isPPO: boolean;
  startDate?: Date;
  certificateProvided: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Job = {
  id: string;
  listingId: string;
  listing?: BaseListing;
  experienceLevel: ExperienceLevel;
  experienceInYears: number;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  salaryPeriod: string; // SalaryPeriod
  createdAt: Date;
  updatedAt: Date;
};

export type ApplicationStatusHistory = {
  id: string;
  applicationId: string;
  status: ApplicationStatus;
  changedAt: Date;
  changedById?: string;
  note?: string;
};

export type Application = {
  id: string;
  listingType: string; // DraftType
  listingId: string;
  jobSeekerId: string;
  resumeId?: string;
  status: ApplicationStatus;
  interviewDate?: Date;
  employerNotes?: string;
  statusHistory?: ApplicationStatusHistory[];
  createdAt: Date;
  updatedAt: Date;
};

export type AiChatLog = {
  id: string;
  prompt: string;
  response: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Feature = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: string; // FeatureStatus
  createdAt: Date;
  updatedAt: Date;
};

export type FeaturePermission = {
  id: string;
  featureId: string;
  userId?: string;
  companyId?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Notification = {
  id: string;
  recipientId: string;
  senderId?: string;
  title: string;
  message: string;
  type: string; // NotificationType
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type NotificationPreference = {
  id: string;
  userId: string;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Pagination = {
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

// Flattened types for frontend convenience (combining BaseListing with Job/Internship)
export type FlattenedJob = BaseListing & Omit<Job, "id" | "listingId" | "listing" | "createdAt" | "updatedAt"> & {
  jobId: string;
};

export type FlattenedInternship = BaseListing & Omit<Internship, "id" | "listingId" | "listing" | "createdAt" | "updatedAt"> & {
  internshipId: string;
};
