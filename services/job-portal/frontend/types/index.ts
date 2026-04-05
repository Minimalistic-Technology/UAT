export enum CompanyRole {
  OWNER = "owner",
  ADMIN = "admin",
  RECRUITER = "recruiter",
}

export enum GlobalRole {
  SUPER_ADMIN = "super_admin",
  USER = "user",
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

export enum ExperienceLevel {
  ENTRY = "entry",
  INTERMEDIATE = "intermediate",
  SENIOR = "senior",
  EXPERT = "expert",
}

export enum JobType {
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

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: GlobalRole;
  avatar?: string;

  // Job Seeker Specific
  resume?: string;
  skills?: string[];
  languages?: string[];
  experience?: Array<{
    title: string;
    company: string;
    location: string;
    startDate: Date;
    endDate?: Date;
    current: boolean;
    description: string;
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    graduationYear: number;
    fieldOfStudy: string;
  }>;
  location?: {
    city: string;
    state: string;
    country: string;
  };

  // Employer Specific
  company?: string; // ObjectId

  // OAuth
  googleId?: string;

  // Status
  isActive: boolean;
  isVerified: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface Job {
  title: string;
  description: string;
  company: string; // ObjectId
  postedBy: string; // ObjectId

  jobType: JobType;
  experienceLevel: ExperienceLevel;

  location: {
    city: string;
    state: string;
    country: string;
    remote: boolean;
  };

  salary: {
    min?: number;
    max?: number;
    currency: string;
    period: 'hourly' | 'monthly' | 'yearly';
  };

  skills: string[];
  requirements: string[];
  benefits?: string[];

  applicationDeadline?: string;
  openings: number;

  status: "active" | "closed" | "draft";
  isFeatured: boolean;

  applicationsCount: number;
  viewsCount: number;

  createdAt: string;
  updatedAt: string;
}

export interface Application {
  job: string; // ObjectId
  resume: string;
  coverLetter?: string;
  status: ApplicationStatus;
  statusHistory: Array<{
    status: ApplicationStatus;
    changedAt: string;
    changedBy?: string;
    note?: string;
  }>;

  employerNotes?: string;

  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  userId: string; // ObjectId
  amount: number; // in paise
  currency: string;

  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;

  webhookEvents: {
    eventId?: string;
    type?: string;
    receivedAt: string;
  }[];

  metadata: Record<string, any>;

  method?: "card" | "upi" | "netbanking" | "wallet";

  failureReason?: string;

  refundId?: string;
  refundAmount?: number;

  status: PaymentStatus;
  receipt?: string;

  capturedAt?: string;

  createdAt: string;
  updatedAt: string;
}


export interface Coupon {
  code: string;
  type: "percentage" | "amount";
  value: number;
  isActive: boolean;
  expiryDate?: string;
  maxUses?: number;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Plan {
  //
}

export interface Company {
  name: string;
  description: string;
  logo?: string;
  website?: string;
  industry: string;
  companySize: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  owner: string; // ObjectId
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface KycDocument {
  user: string; // ObjectId
  companyName: string;
  aadharNo: string;
  gstNo: string;
  cinNo: string;
  photoUrl: string;
  lightbillUrl: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export interface Plan {
  name: string;
  description?: string;
  price: number; // Stored as an Integer (e.g., 1089 instead of 10.89)
  currency: string; // e.g., "INR", "USD"
  durationDays: number;
  jobPostLimit: number;
  isFeatured: boolean;
  isDefault: boolean;
  displayOrder: number;
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  employerId: string; // ObjectId
  planId: string; // ObjectId
  orderId?: string; // Link to your payment gateway (Stripe/Razorpay)
  postsRemaining: number;
  totalPostsGranted: number; // To track original limit (useful for analytics)
  startDate: Date;
  expiryDate: Date;
  status: "active" | "expired" | "depleted" | "cancelled";
  lastBilledAt?: Date; // Useful for recurring billing logic
  createdAt: Date;
  updatedAt: Date;
}

export interface Experience {
  title: string;
  company: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description: string;
}

export interface Education {
  degree: string;
  institution: string;
  graduationYear: number;
  fieldOfStudy: string;
}