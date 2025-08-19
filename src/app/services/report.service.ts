import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { EventReportApiResponse, EventReportResponse, UserReportApiResponse, UserReportResponse } from '../models/report.model';
import { BASE_API_URL } from '../utils/app.constants';

@Injectable({
    providedIn: 'root'
})
export class ReportService {

    constructor(private http: HttpClient) { }

    getUserReport(userId: string): Observable<UserReportResponse> {
        return this.http.get<UserReportApiResponse>(`${BASE_API_URL}/reports/user/${userId}`)
            .pipe(
                map(response => response.result)
            );
    }

    getEventReport(eventId: number): Observable<EventReportResponse> {
        return this.http.get<EventReportApiResponse>(`${BASE_API_URL}/reports/event/${eventId}`)
            .pipe(
                map(response => response.result)
            );
    }
}
