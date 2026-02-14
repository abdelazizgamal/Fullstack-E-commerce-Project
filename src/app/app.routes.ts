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
import { authGuard } from './Core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: Products, pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: 'register', component: Register },
  { path: 'products', component: Products, pathMatch: 'full' },
  { path: 'products/:id', component: ProductDetails },
  { path: 'cart', component: CartComponent, canActivate: [authGuard] },
  { path: 'confirmation', component: ConfirmationComponent },
  { path: 'orders', component: OrdersComponent, pathMatch: 'full', canActivate: [authGuard] },
  { path: 'orders/:id', component: OrderDetailsComponent, canActivate: [authGuard] },
];
