export type HealthStatus = {
  status: "ok";
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  error: {
    message: string;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export type UploadCvData = {
  fileName: string;
  size: number;
  storagePath: string;
  candidateProfile: CandidateProfile;
  matches: JobMatch[];
};

export type CandidateProfile = {
  fullName: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  summary: string | null;
  yearsOfExperience: number;
  roles: string[];
  skills: string[];
  education: string[];
  projects: string[];
  rawText: string;
};

export type JobFixture = {
  id: string;
  source: string;
  title: string;
  company: string;
  location: string | null;
  workMode: "onsite" | "hybrid" | "remote" | "unknown";
  seniority: "intern" | "fresher" | "junior" | "middle" | "senior" | "lead" | "unknown";
  salaryMin: number | null;
  salaryMax: number | null;
  currency: "VND" | "USD" | null;
  skills: string[];
  roleKeywords: string[];
  description: string;
  url: string;
};

export type JobMatch = {
  jobId: string;
  title: string;
  company: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  experienceFit: "low" | "medium" | "high";
  roleFit: "low" | "medium" | "high";
  reasoning: string;
  recommendation: "apply" | "consider" | "low-fit";
};

export type JobRecord = {
  id: string;
  source: string;
  title: string;
  company: string;
  location: string | null;
  workMode: "onsite" | "hybrid" | "remote" | "unknown";
  seniority: "intern" | "fresher" | "junior" | "middle" | "senior" | "lead" | "unknown";
  salaryMin: number | null;
  salaryMax: number | null;
  currency: "VND" | "USD" | null;
  skills: string[];
  roleKeywords: string[];
  description: string;
  url: string;
};
