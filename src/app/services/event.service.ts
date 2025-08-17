import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
    CreateEventRequest,
    EventDetailsResponse,
    EventResponse,
    EventsResponse,
    UpdateEventRequest
} from '../models/event.model';
import { BASE_API_URL } from '../utils/app.constants';

@Injectable({
    providedIn: 'root'
})
export class EventService {
    private readonly apiUrl = `${BASE_API_URL}/events`;

    constructor(private http: HttpClient) { }

    getAllEventsApi(): Observable<EventsResponse> {
        return this.http.get<EventsResponse>(this.apiUrl);
    }

    getEventByIdApi(id: number): Observable<EventDetailsResponse> {
        return this.http.get<EventDetailsResponse>(`${this.apiUrl}/${id}`);
    }

    createEventApi(request: CreateEventRequest): Observable<EventResponse> {
        return this.http.post<EventResponse>(this.apiUrl, request);
    }

    updateEventApi(id: number, request: UpdateEventRequest): Observable<EventResponse> {
        return this.http.put<EventResponse>(`${this.apiUrl}/${id}`, request);
    }

    deleteEventApi(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}
