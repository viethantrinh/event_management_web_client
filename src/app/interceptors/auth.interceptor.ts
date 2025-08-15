import { HttpInterceptorFn } from '@angular/common/http';
import {inject} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {AUTH_TOKEN} from '../utils/app.constants';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Inject the current `AuthService` and use it to get an authentication token:
  const authToken = localStorage.getItem(AUTH_TOKEN);

  if (req.url.includes('auth')) {
    return next(req);
  }

  if (authToken) {
    // Clone the request to add the authentication header.
    const newReq = req.clone({
      headers: req.headers.append('AUTHORIZATION', `Bearer ${authToken}`),
    });
    return next(newReq);
  }

  return next(req);
};
