import { Routes } from '@angular/router';
import { CartComponent } from './components/cart/cart';
import { ConfirmationComponent } from './components/confirmation/confirmation';
import { OrdersComponent } from './components/orders/orders';
import { OrderDetailsComponent } from './components/order-details/order-details'; 


export const routes: Routes = [
    { path: 'cart', component: CartComponent },
    { path: 'confirmation', component: ConfirmationComponent },
    { path: 'orders', component: OrdersComponent },
    { path: 'orders/:id', component: OrderDetailsComponent }
];
