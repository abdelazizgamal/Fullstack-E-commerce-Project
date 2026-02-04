import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { routes } from './app.routes';
import { Register } from "./Components/Register/register";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Register],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('fullstack-e-commerce');
}
