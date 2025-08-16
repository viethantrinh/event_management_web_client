import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/base.model';
import {
    CreateDutyRequest,
    DutiesResponse,
    DutyResponse,
    UpdateDutyRequest
} from '../models/duty.model';
import { BASE_API_URL } from '../utils/app.constants';

@Injectable({
    providedIn: 'root'
})
export class DutyService {
    private readonly apiUrl = `${BASE_API_URL}/duties`;

    constructor(private http: HttpClient) { }

    /**
     * Lấy danh sách tất cả nhiệm vụ
     */
    getAllDutiesApi(): Observable<DutiesResponse> {
        return this.http.get<DutiesResponse>(this.apiUrl);
    }

    /**
     * Lấy thông tin nhiệm vụ theo ID
     */
    getDutyByIdApi(id: number): Observable<DutyResponse> {
        return this.http.get<DutyResponse>(`${this.apiUrl}/${id}`);
    }

    /**
     * Tạo nhiệm vụ mới
     */
    createDutyApi(duty: CreateDutyRequest): Observable<DutyResponse> {
        return this.http.post<DutyResponse>(this.apiUrl, duty);
    }

    /**
     * Cập nhật nhiệm vụ theo ID
     */
    updateDutyApi(id: number, duty: UpdateDutyRequest): Observable<DutyResponse> {
        return this.http.put<DutyResponse>(`${this.apiUrl}/${id}`, duty);
    }

    /**
     * Xóa nhiệm vụ theo ID
     */
    deleteDutyApi(id: number): Observable<ApiResponse<any>> {
        return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
    }
}
