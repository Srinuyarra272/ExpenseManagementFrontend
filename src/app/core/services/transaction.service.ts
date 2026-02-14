import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export enum TransactionType {
  Expense = 0,
  Income = 1
}

export enum PaymentMethod {
  Cash = 0,
  Card = 1,
  UPI = 2,
  BankTransfer = 3
}

export interface CreateTransactionDto {
  amount: number;
  categoryId: string;
  description: string;
  date: string; // ISO string
  type: TransactionType;
  merchant: string;
  paymentMethod: PaymentMethod;
  isRecurring: boolean;
  receiptImage?: File;
}

export interface TransactionFilterParams {
  searchText?: string;
  startDate?: string;
  endDate?: string;
  categoryIds?: string[];
  minAmount?: number;
  maxAmount?: number;
  type?: TransactionType;
  pageNumber: number;
  pageSize: number;
}

export interface TransactionDto {
  id: string;
  amount: number;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  description: string;
  date: string;
  type: string;
  merchant: string;
  paymentMethod: string;
  isRecurring: boolean;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/transactions`;

  getTransactions(filter: TransactionFilterParams): Observable<PagedResult<TransactionDto>> {
    let params: any = {
      pageNumber: filter.pageNumber,
      pageSize: filter.pageSize
    };

    if (filter.searchText) params.searchText = filter.searchText;
    if (filter.startDate) params.startDate = filter.startDate;
    if (filter.endDate) params.endDate = filter.endDate;
    if (filter.minAmount) params.minAmount = filter.minAmount;
    if (filter.maxAmount) params.maxAmount = filter.maxAmount;
    if (filter.type !== undefined) params.type = filter.type;

    // Handle array params manually if needed, or let HttpClient handle it. 
    // HttpClient handles array as key=val&key=val2 if passed directly.
    // However, we need to make sure key name matches. Backend expects 'CategoryIds'.
    // If we use 'categoryIds' in JS object, standard binding should work if case insensitive or configured.
    if (filter.categoryIds && filter.categoryIds.length > 0) {
      params['categoryIds'] = filter.categoryIds;
    }

    return this.http.get<PagedResult<TransactionDto>>(this.apiUrl, { params });
  }

  createTransaction(dto: CreateTransactionDto): Observable<{ id: string }> {
    const formData = this.buildFormData(dto);
    return this.http.post<{ id: string }>(this.apiUrl, formData);
  }

  updateTransaction(id: string, dto: CreateTransactionDto): Observable<void> {
    const formData = this.buildFormData(dto);
    return this.http.put<void>(`${this.apiUrl}/${id}`, formData);
  }

  deleteTransaction(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private buildFormData(dto: CreateTransactionDto): FormData {
    const formData = new FormData();
    formData.append('amount', dto.amount.toString());
    formData.append('categoryId', dto.categoryId);
    formData.append('description', dto.description);
    formData.append('date', dto.date);
    formData.append('type', dto.type.toString());
    formData.append('merchant', dto.merchant);
    formData.append('paymentMethod', dto.paymentMethod.toString());
    formData.append('isRecurring', dto.isRecurring.toString());

    if (dto.receiptImage) {
      formData.append('receiptImage', dto.receiptImage);
    }
    return formData;
  }
}
