export type Role = 'STUDENT' | 'INTERVIEWER' | 'RECRUITER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED';
export type VerificationStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export type BookingStatus = 'REQUESTED' | 'CONFIRMED' | 'COMPLETED' | 'DECLINED' | 'CANCELLED' | 'NO_SHOW' | 'EXPIRED';
export type CancelledBy = 'STUDENT' | 'INTERVIEWER' | 'ADMIN';
export type RescheduleStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
export type BookingSource = 'WEB' | 'ANDROID' | 'IOS' | 'ADMIN';

export type WalletTransactionType =
  | 'CREDIT'
  | 'DEBIT'
  | 'REFUND'
  | 'COMMISSION'
  | 'SETTLEMENT'
  | 'ADJUSTMENT'
  | 'BONUS'
  | 'REVERSAL';

export type InvoiceStatus = 'DRAFT' | 'GENERATED' | 'VOID';
export type Currency = 'INR' | 'USD' | 'EUR';

export type PaymentStatus =
  | 'PENDING'
  | 'AUTHORIZED'
  | 'CAPTURED'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REFUNDED';

export type PaymentMethod =
  | 'UPI'
  | 'CARD'
  | 'NETBANKING'
  | 'WALLET'
  | 'EMI'
  | 'UNKNOWN';

export type WithdrawalStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REJECTED'
  | 'CANCELLED';

export type RefundStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REJECTED';

export type PayoutMethod = 'BANK' | 'UPI';

export interface User {
  id: string;
  email: string;
  role: Role;
  status: UserStatus;
  isEmailVerified: boolean;
  avatarUrl?: string | null;
  timezone?: string;
  createdAt: string;
  updatedAt: string;
  studentProfile?: StudentProfile | null;
  interviewerProfile?: InterviewerProfile | null;
}

export interface StudentProfile {
  id: string;
  userId: string;
  fullName: string;
  college?: string | null;
  degree?: string | null;
  experience?: string | null;
  resumeUrl?: string | null;
  bio?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewerProfile {
  id: string;
  userId: string;
  fullName: string;
  headline?: string | null;
  bio?: string | null;
  currentCompany?: string | null;
  previousCompanies: string[];
  yearsOfExperience: number;
  languages: string[];
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  portfolioUrl?: string | null;
  resumeUrl?: string | null;
  verificationStatus: VerificationStatus;
  verificationReason?: string | null;
  verifiedAt?: string | null;
  user?: { id: string; email: string; avatarUrl?: string | null } | null;
  skills?: any[];
  categories?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Skill {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AvailabilityRule {
  id: string;
  interviewerId: string;
  dayOfWeek: number; // 0-6
  startTime: string; // "09:00"
  endTime: string;   // "17:00"
  slotDurationMins: number;
  bufferMins: number;
  timezone: string;
  isActive: boolean;
}

export interface AvailabilityException {
  id: string;
  interviewerId: string;
  date: string;
  isUnavailable: boolean;
  startTime?: string | null;
  endTime?: string | null;
  reason?: string | null;
}

export interface BookingSlot {
  startTime: string; // ISO string UTC
  endTime: string;   // ISO string UTC
  formattedStart: string; // e.g. "09:00 AM"
  formattedEnd: string;
  durationMinutes: number;
}

export interface Booking {
  id: string;
  referenceCode: string;
  studentId: string;
  interviewerId: string;
  categoryId?: string | null;
  scheduledStart: string;
  scheduledEnd: string;
  durationMinutes: number;
  timezone: string;
  studentNotes?: string | null;
  studentResumeUrl?: string | null;
  status: BookingStatus;
  cancelledBy?: CancelledBy | null;
  cancellationReason?: string | null;
  declineReason?: string | null;
  bookingSource: BookingSource;
  meetingProvider?: string | null;
  meetingUrl?: string | null;
  meetingStatus?: string | null;
  meetingExternalId?: string | null;
  createdAt: string;
  updatedAt: string;
  student?: { id: string; email: string; studentProfile?: StudentProfile } | null;
  studentProfile?: StudentProfile | null;
  interviewer?: InterviewerProfile | null;
  category?: Category | null;
  statusHistory?: BookingStatusHistory[];
  rescheduleRequests?: BookingRescheduleRequest[];
}

export interface BookingRescheduleRequest {
  id: string;
  bookingId: string;
  requesterId: string;
  oldStart: string;
  oldEnd: string;
  requestedStart: string;
  requestedEnd: string;
  reason?: string | null;
  status: RescheduleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BookingStatusHistory {
  id: string;
  bookingId: string;
  fromStatus?: BookingStatus | null;
  toStatus: BookingStatus;
  changedById?: string | null;
  reason?: string | null;
  createdAt: string;
  changedBy?: { id: string; email: string; role: Role } | null;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  website?: string | null;
  description?: string | null;
  industry?: string | null;
  companySize?: string | null;
  headquarters?: string | null;
  foundedYear?: number | null;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  jobs?: Job[];
}

export interface Job {
  id: string;
  companyId: string;
  recruiterId: string;
  title: string;
  description: string;
  employmentType: string;
  experience?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  location?: string | null;
  workMode: string;
  skills: string[];
  openings: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  company?: Company;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
