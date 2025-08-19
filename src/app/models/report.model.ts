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
