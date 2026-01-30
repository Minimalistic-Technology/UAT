export enum UserRole {
  JOB_SEEKER = 'jobseeker',
  EMPLOYER = 'employer',
  ADMIN = 'admin',
}

export enum JobType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  INTERNSHIP = 'internship',
  FREELANCE = 'freelance',
}

export enum ExperienceLevel {
  ENTRY = 'entry',
  INTERMEDIATE = 'intermediate',
  SENIOR = 'senior',
  EXPERT = 'expert',
}

export enum ApplicationStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  SHORTLISTED = 'shortlisted',
  REJECTED = 'rejected',
  INTERVIEW = 'interview',
  OFFERED = 'offered',
  ACCEPTED = 'accepted',
  WITHDRAWN = 'withdrawn',
}

export enum JobStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
  DRAFT = 'draft',
  ARCHIVED = 'archived',
  PENDING = 'pending',
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  resume?: string;
  skills?: string[];
  experience?: Experience[];
  education?: Education[];
  location?: Location;
  company?: Company;
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

export interface Location {
  city: string;
  state: string;
  country: string;
}

export interface Company {
  id: string;
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
}

export interface Job {
  _id: string;
  title: string;
  description: string;
  company: Company;
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
  applicationDeadline?: Date;
  openings: number;
  status: string;
  isFeatured: boolean;
  applicationsCount: number;
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Application {
  id: string;
  job: Job;
  jobSeeker: User;
  resume: string;
  coverLetter?: string;
  status: ApplicationStatus;
  statusHistory: {
    status: ApplicationStatus;
    changedAt: Date;
    note?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}