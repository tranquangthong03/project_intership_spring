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
