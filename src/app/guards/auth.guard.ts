import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { User } from '../Interfaces/user.model';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const userStr = localStorage.getItem('currentUser');

  if (!userStr) {
    return router.createUrlTree(['/login']);
  }

  try {
    const user: User = JSON.parse(userStr);
    if (!user) {
      return router.createUrlTree(['/login']);
    }
  } catch {
    return router.createUrlTree(['/login']);
  }

  return true;
};
