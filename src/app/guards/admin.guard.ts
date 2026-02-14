import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const userStr = localStorage.getItem('currentUser');

  if (!userStr) {
    return router.createUrlTree(['/']);
  }

  try {
    const user = JSON.parse(userStr);
    if (user?.role === 'admin') {
      return true;
    }
  } catch {
    return router.createUrlTree(['/']);
  }

  return router.createUrlTree(['/']);
};
