export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignInResponse {
  token: string;
}

export interface SignUpRequest {
  email: string;
  workEmail: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  academicRank: string;
  academicDegree: string;
}

export interface SignUpResponse {
  token: string;
  email: string;
  workEmail: string;
  fullName: string;
  phoneNumber: string;
  academicRank: string;
  academicDegree: string;
}

export interface IntrospectTokenRequest {
  token: string,
}

export interface IntrospectTokenResponse {
  valid: boolean;
}
