import { Component, inject, signal, effect, afterNextRender } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AsyncPipe, CurrencyPipe, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

import { TransactionService, TransactionDto, TransactionFilterParams, TransactionType } from '../../../core/services/transaction.service';
import { CategoryService } from '../../../core/services/category.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { AddTransactionComponent } from '../add-transaction/add-transaction.component';

import { SatPopoverModule } from '@ncstate/sat-popover';

interface PageEvent {
  pageIndex: number;
  pageSize: number;
  length: number;
}

@Component({
  selector: 'app-transactions-list',
  standalone: true,
  imports: [
    ReactiveFormsModule, AsyncPipe, CurrencyPipe, DatePipe, NgClass, NgFor, NgIf, RouterLink,
    AddTransactionComponent, SatPopoverModule,
    MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatInputModule
  ],
  templateUrl: './transactions-list.component.html',
  styleUrl: './transactions-list.component.css',
  host: { 'class': 'block h-full' }
})
export class TransactionsListComponent {
  private transactionService = inject(TransactionService);
  private categoryService = inject(CategoryService);
  private fb = inject(FormBuilder);

  categories = toSignal(this.categoryService.getAll());

  transactions = signal<TransactionDto[]>([]);
  totalCount = signal<number>(0);
  loading = signal<boolean>(false);

  showAddTransaction = signal<boolean>(false);
  showDeleteModal = signal<boolean>(false);
  transactionToDelete = signal<string | null>(null);
  transactionToEdit = signal<any | null>(null);

  displayedColumns: string[] = ['icon', 'date', 'description', 'category', 'amount', 'actions'];

  filterForm = this.fb.group({
    searchText: [''],
    categoryId: [''], // Single select for now for simplicity, can handle multi later
    type: [''],
    startDate: [null],
    endDate: [null]
  });

  pageSize = 10;
  pageIndex = 0;

  constructor() {
    // Listen to filter changes
    this.filterForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.pageIndex = 0; // Reset to first page
        this.loadData();
      });

    // Initial load
    afterNextRender(() => {
      this.loadData();
    });
  }

  loadData() {
    this.loading.set(true);
    const val = this.filterForm.value;

    // Convert form values to filter params
    const filter: TransactionFilterParams = {
      pageNumber: this.pageIndex + 1,
      pageSize: this.pageSize,
      searchText: val.searchText || undefined,
      categoryIds: val.categoryId ? [val.categoryId] : undefined,
      type: (val.type !== null && val.type !== undefined && val.type !== '' && val.type !== 'null') ? Number(val.type) as TransactionType : undefined,
      startDate: val.startDate ? new Date(val.startDate).toISOString() : undefined,
      endDate: val.endDate ? new Date(val.endDate).toISOString() : undefined
    };

    this.transactionService.getTransactions(filter).subscribe({
      next: (res) => {
        this.transactions.set(res.items);
        this.totalCount.set(res.totalCount);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadData();
  }

  getTypeLabel(type: string): string {
    return type === 'Expense' ? 'Expense' : 'Income';
  }

  openAddTransaction() {
    this.transactionToEdit.set(null);
    this.showAddTransaction.set(true);
  }

  closeAddTransaction() {
    this.showAddTransaction.set(false);
    this.transactionToEdit.set(null);
  }

  onTransactionAdded() {
    this.closeAddTransaction();
    this.loadData();
  }

  editTransaction(transaction: TransactionDto, event: Event) {
    event.stopPropagation();
    this.transactionToEdit.set(transaction);
    this.showAddTransaction.set(true);
  }

  confirmDelete(id: string, event: Event) {
    event.stopPropagation();
    this.transactionToDelete.set(id);
    this.showDeleteModal.set(true);
  }

  cancelDelete() {
    this.showDeleteModal.set(false);
    this.transactionToDelete.set(null);
  }

  deleteTransaction() {
    const id = this.transactionToDelete();
    if (id) {
      this.transactionService.deleteTransaction(id).subscribe({
        next: () => {
          this.showDeleteModal.set(false);
          this.transactionToDelete.set(null);
          this.loadData();
        },
        error: (err: any) => {
          console.error('Error deleting transaction:', err);
          alert('Failed to delete transaction');
        }
      });
    }
  }
}
