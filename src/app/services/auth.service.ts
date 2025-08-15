import {inject, Injectable, signal} from '@angular/core';
import {AUTH_TOKEN, BASE_API_URL} from '../utils/app.constants';
import {UserResponse} from '../models/user.model';
import {catchError, map, Observable, of, tap} from 'rxjs';
import {
  IntrospectTokenRequest,
  IntrospectTokenResponse,
  SignInRequest,
  SignInResponse,
  SignUpRequest, SignUpResponse
} from '../models/auth.model';
import {HttpClient} from '@angular/common/http';
import {ApiResponse} from '../models/base.model';
import {UserService} from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // properties
  private readonly baseAuthUrl = `${BASE_API_URL}/auth`;
  private readonly signInUrl = this.baseAuthUrl + '/sign-in';
  private readonly signUpUrl = this.baseAuthUrl + '/sign-up';
  private readonly introspectTokenUrl = this.baseAuthUrl + '/introspect-token';

  // dependencies
  private readonly http = inject(HttpClient);
  private readonly userService = inject(UserService);

  // private signal
  private currentUserSignal = signal<UserResponse | null>(null)

  // public signal
  public currentUser = this.currentUserSignal.asReadonly();

  constructor() {
    this.checkStoredToken()
    console.log('check store token')
  }

  public signInApi(request: SignInRequest): Observable<SignInResponse | undefined> {
    return this.http.post<ApiResponse<SignInResponse>>(this.signInUrl, request)
      .pipe(
        map(response => response.result),
        tap(result => {
          if (result) {
            this.storeToken(result.token);
            this.loadCurrentUser();
          }
        })
      );
  }

  public signUpApi(request: SignUpRequest): Observable<SignUpResponse | undefined> {
    return this.http.post<ApiResponse<SignUpResponse>>(this.signUpUrl, request)
      .pipe(
        map(response => response.result),
        tap(result => {
          if (result) {
            this.storeToken(result.token);
            this.loadCurrentUser();
          }
        })
      );
  }

  public introspectTokenApi(request?: IntrospectTokenRequest): Observable<boolean> {
    const tokenToCheck = request?.token || this.retrieveToken();

    if (!tokenToCheck) {
      return of(false)
    }

    request = {token: tokenToCheck}
    return this.http.post<ApiResponse<IntrospectTokenResponse>>(this.introspectTokenUrl, request)
      .pipe(
        map(response => response.result?.valid??false),
        catchError(err => {
          console.error('Error when introspect token:', err);
          this.clearToken();
          return of(false)
        })
      );
  }

  private loadCurrentUser() {
    if (this.retrieveToken()) {
      this.userService.getCurrentUserInfoApi()
        .pipe(
          tap(result => {
            if (result) this.currentUserSignal.set(result)
          }),
          catchError(err => {
            console.error('Error getting current user:', err);
            this.clearToken();
            return of(null as any)
          })
        ).subscribe()
    }
  }

  public isAuthenticated(): boolean {
    return !!this.retrieveToken();
  }

  private storeToken(token: string) {
    localStorage.setItem(AUTH_TOKEN, token);
  }

  public retrieveToken() {
    return localStorage.getItem(AUTH_TOKEN);
  }

  private clearToken() {
    localStorage.removeItem(AUTH_TOKEN);
    this.currentUserSignal.set(null);
  }

  private checkStoredToken() {
    const token = this.retrieveToken();
    if (token) {
      this.introspectTokenApi({token: token}).subscribe(valid => {
        if (valid) {
          this.loadCurrentUser();
        }
      })
    }
  }
}
