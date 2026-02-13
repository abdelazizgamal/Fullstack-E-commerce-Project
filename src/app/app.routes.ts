import { Routes } from '@angular/router';
import { Login } from './Components/login/login';
import { Register } from './Components/Register/register';
import { Products } from './Components/products/products';
import { ProductDetails } from './Components/product-details/product-details';

export const routes: Routes = [
  { path: '', component: Products },
  { path: 'login', component: Login },
  { path: 'products', component: Products },
  { path: 'products/:id', component: ProductDetails },
];
