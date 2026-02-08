import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BillService, BillDto, CreateBillDto } from '../../core/services/bill.service';
import { CategoryService } from '../../core/services/category.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { TransactionType } from '../../core/services/transaction.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-bills',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe, DatePipe, NgClass, MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatInputModule, MatMenuModule, MatButtonModule],
  templateUrl: './bills.component.html',
  styleUrl: './bills.component.css'
})
export class BillsComponent implements OnInit {
  private billService = inject(BillService);
  private categoryService = inject(CategoryService);
  private fb = inject(FormBuilder);

  bills = signal<BillDto[]>([]);
  loading = signal(false);
  showModal = signal(false);
  showDeleteModal = signal(false);
  billToDelete = signal<string | null>(null);
  editingBill = signal<BillDto | null>(null);

  categories = toSignal(this.categoryService.getAll(), { initialValue: [] });

  expenseCategories = computed(() => {
    const cats = this.categories();
    return cats.filter(c => c.type === TransactionType.Expense);
  });

  billForm = this.fb.group({
    name: ['', Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    categoryId: ['', Validators.required],
    dueDate: ['', Validators.required],
    frequency: ['Monthly', Validators.required],
    isActive: [true],
    notes: ['']
  });

  ngOnInit() {
    this.loadBills();
  }

  loadBills() {
    this.loading.set(true);
    this.billService.getBills().subscribe({
      next: (bills) => {
        this.bills.set(bills);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading bills:', err);
        this.loading.set(false);
      }
    });
  }

  openModal(bill?: BillDto) {
    if (bill) {
      this.editingBill.set(bill);
      this.billForm.patchValue({
        name: bill.name,
        amount: bill.amount,
        categoryId: bill.categoryId,
        dueDate: new Date(bill.dueDate).toISOString().split('T')[0],
        frequency: bill.frequency,
        isActive: bill.isActive,
        notes: bill.notes || ''
      });
    } else {
      this.editingBill.set(null);
      this.billForm.reset({
        frequency: 'Monthly',
        isActive: true
      });
    }
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingBill.set(null);
    this.billForm.reset();
  }

  onSubmit() {
    if (this.billForm.valid) {
      const formValue = this.billForm.value;
      const billData: CreateBillDto = {
        name: formValue.name!,
        amount: formValue.amount!,
        categoryId: formValue.categoryId!,
        dueDate: new Date(formValue.dueDate!).toISOString(),
        frequency: formValue.frequency!,
        isActive: formValue.isActive!,
        notes: formValue.notes || undefined
      };

      const editing = this.editingBill();
      const request$: Observable<unknown> = editing
        ? this.billService.updateBill(editing.id, billData)
        : this.billService.createBill(billData);

      request$.subscribe({
        next: () => {
          this.closeModal();
          this.loadBills();
        },
        error: (err: any) => {
          console.error('Error saving bill:', err);
          alert('Failed to save bill');
        }
      });
    }
  }

  confirmDelete(id: string) {
    this.billToDelete.set(id);
    this.showDeleteModal.set(true);
  }

  cancelDelete() {
    this.showDeleteModal.set(false);
    this.billToDelete.set(null);
  }

  deleteBill() {
    const id = this.billToDelete();
    if (id) {
      this.billService.deleteBill(id).subscribe({
        next: () => {
          this.showDeleteModal.set(false);
          this.billToDelete.set(null);
          this.loadBills();
        },
        error: (err: any) => {
          console.error('Error deleting bill:', err);
          alert('Failed to delete bill');
        }
      });
    }
  }

  togglePaidStatus(bill: BillDto) {
    this.billService.markAsPaid(bill.id, !bill.isPaid).subscribe({
      next: () => {
        this.loadBills();
      },
      error: (err: any) => {
        console.error('Error updating bill status:', err);
        alert('Failed to update bill status');
      }
    });
  }

  get upcomingBills() {
    return this.bills().filter(b => !b.isPaid && b.isActive);
  }

  get paidBills() {
    return this.bills().filter(b => b.isPaid);
  }

  get totalUpcoming() {
    return this.upcomingBills.reduce((sum, bill) => sum + bill.amount, 0);
  }
}
