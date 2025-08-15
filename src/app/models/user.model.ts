import {RoleResponse} from './role.model';

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

