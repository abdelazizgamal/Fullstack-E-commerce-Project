import { Routes } from '@angular/router';
import { Login } from './Components/login/login';
import { Register } from './Components/Register/register';
import { Products } from './Components/products/products';
import { ProductDetails } from './Components/product-details/product-details';
import { Profile } from './Components/profile/profile';

export const routes: Routes = [
  { path: '', component: Register },

  { path: 'login', component: Login },
  { path: 'profile', component: Profile },
  { path: 'register', component: Register },
  { path: 'products', component: Products },
  { path: 'products/:id', component: ProductDetails },
];
