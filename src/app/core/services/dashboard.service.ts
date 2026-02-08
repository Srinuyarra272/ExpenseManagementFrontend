import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardMetrics {
  totalSpentThisMonth: number;
  totalSpentThisWeek: number;
  budgetUtilizationPercentage: number;
  topCategories: { name: string; value: number; color: string }[];
  transactionCount: number;
  averageDailySpend: number;
  recentTransactions: RecentTransaction[];
  upcomingBillsCount: number;
  upcomingBillsTotal: number;
  savingsRate: number;
  cashflow: number;
  dailyTrends: DailyTrend[];
}

export interface DailyTrend {
  date: Date;
  day: number;
  dailyAmount: number;
  cumulativeAmount: number;
}

export interface RecentTransaction {
  id: string;
  description: string;
  amount: number;
  date: Date;
  categoryName: string;
  type: string;
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  // Assuming backend runs on 5000 (check if http or https)
  // Angular proxy or CORS config needed if different ports
  private apiUrl = 'http://localhost:5000/api/dashboard';

  getMetrics(month?: number, year?: number): Observable<DashboardMetrics> {
    let params: any = {};
    if (month) params.month = month;
    if (year) params.year = year;
    return this.http.get<DashboardMetrics>(this.apiUrl, { params });
  }
}
