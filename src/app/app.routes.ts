import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
        data: { animation: 'LoginPage' }
    },
    {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
        data: { animation: 'RegisterPage' }
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [authGuard],
        data: { animation: 'DashboardPage' }
    },
    {
        path: 'transactions',
        loadComponent: () => import('./features/transactions/transactions-list/transactions-list.component').then(m => m.TransactionsListComponent),
        canActivate: [authGuard],
        data: { animation: 'TransactionsPage' }
    },
    {
        path: 'add-transaction',
        loadComponent: () => import('./features/transactions/add-transaction/add-transaction.component').then(m => m.AddTransactionComponent),
        canActivate: [authGuard],
        data: { animation: 'AddTransactionPage' }
    },
    {
        path: 'budgets',
        loadComponent: () => import('./features/budget/budget.component').then(m => m.BudgetComponent),
        canActivate: [authGuard],
        data: { animation: 'BudgetsPage' }
    },
    {
        path: 'bills',
        loadComponent: () => import('./features/bills/bills.component').then(m => m.BillsComponent),
        canActivate: [authGuard],
        data: { animation: 'BillsPage' }
    },
    {
        path: 'categories',
        loadComponent: () => import('./features/categories/categories.component').then(m => m.CategoriesComponent),
        canActivate: [authGuard],
        data: { animation: 'CategoriesPage' }
    },
    {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [authGuard],
        data: { animation: 'ProfilePage' }
    }
];
