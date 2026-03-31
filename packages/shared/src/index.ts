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
