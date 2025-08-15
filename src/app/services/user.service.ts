import {inject, Injectable} from '@angular/core';
import {BASE_API_URL} from '../utils/app.constants';
import {map, Observable, tap} from 'rxjs';
import {UserResponse} from '../models/user.model';
import {HttpClient} from '@angular/common/http';
import {ApiResponse} from '../models/base.model';

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
}
