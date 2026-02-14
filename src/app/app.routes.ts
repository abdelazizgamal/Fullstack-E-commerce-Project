import { Routes } from '@angular/router';
import { Login } from './Components/login/login';
import { Register } from './Components/Register/register';
import { Products } from './Components/products/products';
import { ProductDetails } from './Components/product-details/product-details';
import { Profile } from './Components/profile/profile';
import { CartComponent } from './Components/cart/cart';
import { ConfirmationComponent } from './Components/confirmation/confirmation';
import { OrdersComponent } from './Components/orders/orders';
import { OrderDetailsComponent } from './Components/order-details/order-details';

export const routes: Routes = [
  { path: '', component: Products, pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'profile', component: Profile },
  { path: 'register', component: Register },
  { path: 'products', component: Products, pathMatch: 'full' },
  { path: 'products/:id', component: ProductDetails },
  { path: 'cart', component: CartComponent },
  { path: 'confirmation', component: ConfirmationComponent },
  { path: 'orders', component: OrdersComponent, pathMatch: 'full' },
  { path: 'orders/:id', component: OrderDetailsComponent },
];
