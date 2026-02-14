import { Routes } from '@angular/router';
import { Login } from './Components/login/login';
import { Register } from './Components/Register/register';
import { Profile } from './Components/profile/profile';
import { Admin } from './Components/admin/admin';
import { Allorders } from './Components/allorders/allorders';

export const routes: Routes = [
  {path: '', component: Register},

    {path: 'login', component: Login},
    {path: 'profile', component: Profile},
    {path: 'admin', component: Admin},
    {path: 'AllOrders', component: Allorders}

];
