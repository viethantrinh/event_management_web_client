export interface EventParticipation {
    eventId: number;
    eventName: string;
    eventDescription: string;
    startDate: string;
    endDate: string;
    dutyName: string;
    dutyDescription: string;
    score: number;
}

export interface UserReportResponse {
    userId: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    eventParticipations: EventParticipation[];
    totalEvents: number;
    totalScore: number;
}

export interface UserReportApiResponse {
    code: number;
    message: string;
    timestamp: string;
    result: UserReportResponse;
}

// Event Report Models
export interface EventParticipant {
    sequenceNumber: number;
    userId: string;
    fullName: string;
    dutyName: string;
    score: number;
}

export interface EventReportResponse {
    eventId: number;
    eventName: string;
    eventDescription: string;
    startDate: string;
    endDate: string;
    participants: EventParticipant[];
    totalParticipants: number;
    dutyDistribution: { [key: string]: number };
}

export interface EventReportApiResponse {
    code: number;
    message: string;
    timestamp: string;
    result: EventReportResponse;
}