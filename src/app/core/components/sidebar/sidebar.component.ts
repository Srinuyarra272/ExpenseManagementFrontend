import { Component, inject, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { NgClass } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [RouterLink, RouterLinkActive, NgClass],
    template: `
    <div class="h-full flex flex-col bg-white/95 backdrop-blur-lg border border-gray-100 md:rounded-2xl shadow-xl transition-all duration-300 relative dark:bg-slate-900/95 dark:border-slate-800"
         [class.items-center]="collapsed" [class.w-full]="true">
      
      <!-- Toggle Button (Desktop Only) -->
      <button (click)="onToggle()" 
              class="hidden md:flex absolute -right-3 top-9 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center shadow-sm text-gray-500 hover:text-slate-900 transition-colors z-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:text-white">
          <span class="material-icons text-sm">{{ collapsed ? 'chevron_right' : 'chevron_left' }}</span>
      </button>

      <!-- Logo -->
      <div class="p-6 md:p-8 flex items-center gap-3 transition-all duration-300" [class.justify-center]="collapsed" [class.p-4]="collapsed">
        <div class="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 dark:bg-slate-800">
            <span class="material-icons text-xl text-white">currency_rupee</span>
        </div>
        @if (!collapsed) {
        <span class="text-xl font-bold text-gray-900 tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300 dark:text-white">Expense Manager</span>
        }
      </div>

      <!-- Mobile Close Button -->
      <div class="p-4 md:hidden flex justify-end">
          <button (click)="onLinkClick()" class="p-2 text-gray-500 dark:text-slate-400">
            <span class="material-icons">close</span>
          </button>
      </div>

      <!-- Nav Links -->
      <nav class="flex-1 px-3 mt-2 overflow-y-auto w-full transition-all duration-300 relative">
        <!-- Sliding Active Indicator -->
        <div class="absolute left-3 right-3 h-[48px] bg-slate-100 dark:bg-slate-800 rounded-xl transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) z-0"
             [style.transform]="'translateY(' + activeLinkTop + ')'"
             [class.opacity-0]="activeIndex === -1"
             style="top: 0;">
        </div>

        <div class="space-y-3 relative z-10 mt-[1px]"> <!-- consistent spacing matching the stride -->
            @for (item of navItems; track item.route; let i = $index) {
            <a [routerLink]="item.route" (click)="onLinkClick()" 
               class="flex items-center gap-3 px-3 py-3 text-gray-500 hover:text-slate-900 rounded-xl transition-colors group font-medium dark:text-slate-400 dark:hover:text-white h-[48px]"
               [class.justify-center]="collapsed" 
               [class.text-slate-900]="activeIndex === i" 
               [class.dark:text-white]="activeIndex === i"
               [title]="collapsed ? item.label : ''">
                <span class="material-icons transition-colors flex-shrink-0" 
                      [class.text-slate-900]="activeIndex === i" 
                      [class.dark:text-white]="activeIndex === i">
                      {{ item.icon }}
                </span>
                @if (!collapsed) {
                <span class="whitespace-nowrap overflow-hidden transition-all duration-300">{{ item.label }}</span>
                }
            </a>
            }
        </div>
      </nav>

      <!-- Theme Toggle & User Profile -->
      <div class="p-4 border-t border-gray-100/50 w-full transition-all duration-300 space-y-2 dark:border-slate-800">
        
        <!-- Theme Toggle -->
        <button (click)="toggleTheme()" 
                class="w-full flex items-center gap-3 px-3 py-2 text-gray-500 hover:bg-gray-50 hover:text-slate-900 rounded-xl transition-all group dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                [class.justify-center]="collapsed" [title]="collapsed ? 'Toggle Theme' : ''">
            <span class="material-icons transition-transform group-hover:rotate-12">{{ themeService.darkMode() ? 'light_mode' : 'dark_mode' }}</span>
            @if (!collapsed) {
                <span class="font-medium whitespace-nowrap overflow-hidden transition-all duration-300">{{ themeService.darkMode() ? 'Light Mode' : 'Dark Mode' }}</span>
            }
        </button>

        <!-- Profile -->
        <div class="relative flex items-center gap-3 px-2 py-2 group cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-all" 
             [class.justify-center]="collapsed"
             (click)="navigateToProfile()">
            
            <div class="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0 dark:bg-slate-700 group-hover:scale-105 transition-transform">
                {{ userInitials }}
            </div>
            
            @if (!collapsed) {
            <div class="flex-1 min-w-0 transition-opacity duration-300">
                <p class="text-sm font-bold text-gray-900 truncate dark:text-white">{{ userName }}</p>
                <p class="text-xs text-gray-500 truncate dark:text-slate-400">{{ userEmail }}</p>
            </div>
            <button (click)="$event.stopPropagation(); logout()" class="text-gray-400 hover:text-slate-900 transition-colors dark:hover:text-white p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700" title="Logout">
                <span class="material-icons">logout</span>
            </button>
            }
        </div>
      </div>
    </div>
    `
})
export class SidebarComponent implements OnInit {
    authService = inject(AuthService);
    themeService = inject(ThemeService);
    public router = inject(Router);

    @Input() collapsed = false;
    @Output() linkClicked = new EventEmitter<void>();
    @Output() toggle = new EventEmitter<void>();

    navItems = [
        { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
        { label: 'Budgets', icon: 'savings', route: '/budgets' },
        { label: 'Bills', icon: 'receipt', route: '/bills' },
        { label: 'Transactions', icon: 'receipt_long', route: '/transactions' },
        { label: 'Categories', icon: 'label', route: '/categories' }
    ];

    activeIndex = -1;

    // Item height (48px) + Gap (8px) = 56px
    // Note: Adjust specific pixel values if styling changes
    get activeLinkTop(): string {
        return `${this.activeIndex * 60}px`; // 48px height + 12px gap-like spacing logic
    }

    ngOnInit() {
        this.updateActiveIndex();
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe(() => {
            this.updateActiveIndex();
        });
    }

    private updateActiveIndex() {
        const currentUrl = this.router.url;
        this.activeIndex = this.navItems.findIndex(item => currentUrl.includes(item.route));
    }

    onLinkClick() {
        this.linkClicked.emit();
    }

    navigateToProfile() {
        this.router.navigate(['/profile']);
        this.onLinkClick();
    }

    onToggle() {
        this.toggle.emit();
    }

    toggleTheme() {
        this.themeService.toggle();
    }

    get userInitials(): string {
        const user = this.authService.currentUser();
        if (!user) return 'U';
        return (user.firstName[0] + user.lastName[0]).toUpperCase();
    }

    get userName(): string {
        const user = this.authService.currentUser();
        return user ? `${user.firstName} ${user.lastName}` : 'User';
    }

    get userEmail(): string {
        return this.authService.currentUser()?.email || '';
    }

    logout() {
        this.authService.logout();
    }
}
