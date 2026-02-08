import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BudgetDto {
    id: string;
    categoryId: string;
    categoryName: string;
    categoryColor: string;
    categoryIcon: string;
    amount: number;
    spent: number;
    remaining: number;
    percentage: number;
    month: number;
    year: number;
}

export interface CreateBudgetDto {
    categoryId: string;
    amount: number;
    month: number;
    year: number;
}

@Injectable({
    providedIn: 'root'
})
export class BudgetService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:5000/api/budgets';

    getBudgets(month: number, year: number): Observable<BudgetDto[]> {
        let params = new HttpParams().set('month', month).set('year', year);
        return this.http.get<BudgetDto[]>(this.apiUrl, { params });
    }

    createBudget(budget: CreateBudgetDto): Observable<string> {
        return this.http.post(this.apiUrl, budget, { responseType: 'text' });
    }

    updateBudget(id: string, amount: number): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}`, amount);
    }

    deleteBudget(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
