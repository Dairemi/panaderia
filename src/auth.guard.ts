import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map} from 'rxjs';
import { AuthService } from './app/services/auth.service';


export const authGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.user$.pipe(
    map((user) => {
      if (user) {
        return true;
      } else {
        router.navigate(['']);
        return false;
      }
      })
  );
};
