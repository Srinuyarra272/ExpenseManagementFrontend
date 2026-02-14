import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: number; // 0 = Income, 1 = Expense
  userId?: string;
}

export interface CreateCategoryDto {
  name: string;
  icon: string;
  color: string;
  type: number;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/categories`;

  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  create(category: CreateCategoryDto): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, category);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
