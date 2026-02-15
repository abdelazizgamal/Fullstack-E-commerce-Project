import { Component, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { Header } from './Components/header/header';
import { Footer } from './Components/footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('fullstack-e-commerce');
  showFooter = signal(true);

  constructor(private router: Router) {
    this.updateFooterVisibility(this.router.url);

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const navEvent = event as NavigationEnd;
        this.updateFooterVisibility(navEvent.urlAfterRedirects);
      });
  }

  private updateFooterVisibility(url: string): void {
    const path = url.split('?')[0];
    this.showFooter.set(path !== '/login' && path !== '/register');
  }
}
