import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Login } from "./Components/login/login";
import { routes } from './app.routes';
import { Register } from "./Components/Register/register";
import { Header } from "./Components/header/header";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Register, Header],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('fullstack-e-commerce');
}
