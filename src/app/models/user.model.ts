import { RoleResponse } from './role.model';

export interface UserResponse {
  id: string;
  email: string;
  workEmail?: string;
  fullName: string;
  phoneNumber: string;
  academicRank: string;
  academicDegree: string;
  roles: RoleResponse[];
}

export interface CreateUserRequest {
  email: string;
  workEmail?: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  academicRank: string;
  academicDegree: string;
  roleNames: string[];
}

export interface UpdateUserRequest {
  email: string;
  workEmail?: string;
  fullName: string;
  phoneNumber: string;
  academicRank: string;
  academicDegree: string;
  roleNames: string[];
}

export interface UserListParams {
  page?: number;
  size?: number;
  search?: string;
  role?: string;
  academicRank?: string;
  academicDegree?: string;
}

