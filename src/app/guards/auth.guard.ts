import {CanActivateFn, Router} from '@angular/router';
import {AUTH_TOKEN} from '../utils/app.constants';
import {inject} from '@angular/core';
import {map, Observable} from 'rxjs';
import {AuthService} from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const token = localStorage.getItem(AUTH_TOKEN);

  if (!token) {
    router.navigate(['/auth'])
    return false;
  }

  return authService.introspectTokenApi().pipe(
    map(valid => {
      if (!valid) {
        router.navigate(['/auth']);
        return false;
      }

      return true;
    })
  );
};
