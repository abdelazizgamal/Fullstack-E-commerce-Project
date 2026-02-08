import { Routes } from '@angular/router';
import { Login } from './Components/login/login';
import { Register } from './Components/Register/register';
import { Profile } from './Components/profile/profile';

export const routes: Routes = [
  {path: '', component: Register},

    {path: 'login', component: Login},
    {path: 'profile', component: Profile}

];
