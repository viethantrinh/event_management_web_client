import { ApiResponse } from './base.model';

export interface Event {
    id: number;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
}

export interface EventDuty {
    dutyId: number;
    dutyName: string;
    score: number;
    assignedUser?: {
        userId: string;
        fullName: string;
    };
}

export interface EventParticipant {
    userId: string;
    fullName: string;
    academicRank: string;
    academicDegree: string;
    assignedDuty?: {
        dutyId: number;
        dutyName: string;
        score: number;
    };
}

export interface EventDetails {
    id: number;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    duties: EventDuty[];
    participants: EventParticipant[];
}

export interface EventDutyRequest {
    dutyId: number;
    score: number;
}

export interface EventAssignmentRequest {
    userId: string;
    dutyId: number;
}

export interface CreateEventRequest {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    duties: EventDutyRequest[];
    assignments: EventAssignmentRequest[];
}

export interface UpdateEventRequest {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    duties: EventDutyRequest[];
    assignments: EventAssignmentRequest[];
}

export type EventResponse = ApiResponse<Event>;
export type EventsResponse = ApiResponse<Event[]>;
export type EventDetailsResponse = ApiResponse<EventDetails>;
