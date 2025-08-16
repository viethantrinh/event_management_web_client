import { ApiResponse } from './base.model';

export interface Duty {
    id: number;
    name: string;
    description: string;
}

export interface CreateDutyRequest {
    name: string;
    description: string;
}

export interface UpdateDutyRequest {
    name: string;
    description: string;
}

export type DutyResponse = ApiResponse<Duty>;
export type DutiesResponse = ApiResponse<Duty[]>;
