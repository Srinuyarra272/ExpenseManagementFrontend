import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If user is already logged in, redirect to dashboard
  if (authService.currentUser()) {
    return router.createUrlTree(['/dashboard']);
  }

  // Otherwise, allow access to the route (login/register)
  return true;
};
