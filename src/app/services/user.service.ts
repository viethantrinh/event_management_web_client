import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '../models/base.model';
import { CreateUserRequest, UpdateUserRequest, UserResponse } from '../models/user.model';
import { BASE_API_URL } from '../utils/app.constants';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  // properties
  private readonly baseUserUrl = `${BASE_API_URL}/users`
  private readonly getCurrentUserInfoUrl = this.baseUserUrl + '/info'

  // dependencies
  private readonly http = inject(HttpClient);


  public getCurrentUserInfoApi(): Observable<UserResponse | undefined> {
    return this.http.get<ApiResponse<UserResponse>>(this.getCurrentUserInfoUrl)
      .pipe(
        map(response => response.result)
      );
  }

  public getAllUsersApi(): Observable<UserResponse[]> {
    return this.http.get<ApiResponse<UserResponse[]>>(this.baseUserUrl)
      .pipe(
        map(response => response.result || [])
      );
  }

  public createUserApi(request: CreateUserRequest): Observable<UserResponse | undefined> {
    return this.http.post<ApiResponse<UserResponse>>(this.baseUserUrl, request)
      .pipe(
        map(response => response.result)
      );
  }

  public getUserByIdApi(id: string): Observable<UserResponse | undefined> {
    return this.http.get<ApiResponse<UserResponse>>(`${this.baseUserUrl}/${id}`)
      .pipe(
        map(response => response.result)
      );
  }

  public updateUserApi(id: string, request: UpdateUserRequest): Observable<UserResponse | undefined> {
    return this.http.put<ApiResponse<UserResponse>>(`${this.baseUserUrl}/${id}`, request)
      .pipe(
        map(response => response.result)
      );
  }

  public deleteUserApi(id: string): Observable<boolean> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUserUrl}/${id}`)
      .pipe(
        map(response => response.code === 1000)
      );
  }
}
