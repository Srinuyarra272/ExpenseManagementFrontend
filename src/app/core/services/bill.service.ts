import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface BillDto {
    id: string;
    name: string;
    amount: number;
    categoryId: string;
    categoryName: string;
    categoryIcon: string;
    categoryColor: string;
    dueDate: string;
    frequency: string;
    isActive: boolean;
    isPaid: boolean;
    notes?: string;
}

export interface CreateBillDto {
    name: string;
    amount: number;
    categoryId: string;
    dueDate: string;
    frequency: string;
    isActive: boolean;
    notes?: string;
}

@Injectable({
    providedIn: 'root'
})
export class BillService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/bills`;

    getBills(): Observable<BillDto[]> {
        return this.http.get<BillDto[]>(this.apiUrl);
    }

    createBill(bill: CreateBillDto): Observable<{ id: string }> {
        return this.http.post<{ id: string }>(this.apiUrl, bill);
    }

    updateBill(id: string, bill: CreateBillDto): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}`, bill);
    }

    deleteBill(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    markAsPaid(id: string, isPaid: boolean): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/${id}/paid`, { isPaid });
    }
}
