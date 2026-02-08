import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { SidebarComponent } from './core/components/sidebar/sidebar.component';
import { NgIf } from '@angular/common';
import { routeAnimations } from './core/animations/route.animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, NgIf],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [routeAnimations]
})
export class AppComponent {
  authService = inject(AuthService);
  title = 'frontend';
  mobileMenuOpen = signal(false);
  sidebarCollapsed = signal(false);

  getRouteAnimationData(outlet: RouterOutlet) {
    // Returns the route path (or generic state) to trigger animation on change
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.update(v => !v);
  }

  toggleSidebar() {
    this.sidebarCollapsed.update(v => !v);
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }
}
