import { Component, inject, computed, effect, signal, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TransactionService, TransactionType, PaymentMethod } from '../../../core/services/transaction.service';
import { CategoryService } from '../../../core/services/category.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { CurrencyPipe, NgClass, JsonPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-add-transaction',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink,
    CurrencyPipe, NgClass, JsonPipe,
    MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatInputModule
  ],
  templateUrl: './add-transaction.component.html',
  styleUrl: './add-transaction.component.css'
})
export class AddTransactionComponent {
  private fb = inject(FormBuilder);
  private transactionService = inject(TransactionService);
  private categoryService = inject(CategoryService);
  private router = inject(Router);

  @Input() transactionData: any | null = null; // Using any temporarily to avoid strict type mapping issues, ideally verify TransactionDto
  @Input() editMode = false;

  @Output() transactionAdded = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  TransactionType = TransactionType;
  PaymentMethod = PaymentMethod;

  file: File | null = null;
  previewUrl: string | null = null;

  // Standalone signal for reactivity to avoid initialization order issues
  transactionType = signal<TransactionType>(TransactionType.Expense);

  form = this.fb.group({
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    categoryId: ['', Validators.required],
    description: ['', Validators.required],
    date: [new Date().toISOString().split('T')[0], Validators.required],
    type: [TransactionType.Expense, Validators.required],
    merchant: [''],
    paymentMethod: [PaymentMethod.Cash, Validators.required],
    isRecurring: [false]
  });

  allCategories = toSignal(this.categoryService.getAll(), { initialValue: [] });

  filteredCategories = computed(() => {
    const categories = this.allCategories();
    const currentType = this.transactionType();
    return categories.filter(c => c.type === (currentType as any));
  });

  constructor() {
    effect(() => {
      // If transactionData changes, patch the form
      if (this.transactionData && this.allCategories().length > 0) {
        this.patchForm(this.transactionData);
      }
    }, { allowSignalWrites: true });
  }

  private patchForm(data: any) {
    // Map string values back to enums if necessary
    // Assuming backend returns strings like "Expense", "Cash" in GetAll DTO
    // We need to match them to enums: Expense=0, Income=1

    const typeEnum = data.type === 'Income' ? TransactionType.Income : TransactionType.Expense;
    this.transactionType.set(typeEnum);

    // Map Payment Method string to Enum. Simple lookup or switch
    let pm = PaymentMethod.Cash;
    if (data.paymentMethod === 'Card') pm = PaymentMethod.Card;
    if (data.paymentMethod === 'UPI') pm = PaymentMethod.UPI;
    if (data.paymentMethod === 'BankTransfer') pm = PaymentMethod.BankTransfer;

    // Find category ID based on Name if ID is missing in DTO, or use ID if available
    // The current TransactionDto DOES NOT have categoryId! It has categoryName.
    // This is a problem. We need categoryId to edit.
    // We should look up category by name from `allCategories` 
    const cat = this.allCategories().find(c => c.name === data.categoryName && c.type === (typeEnum as any));

    this.form.patchValue({
      amount: data.amount,
      categoryId: cat ? cat.id : '',
      description: data.description,
      date: data.date ? new Date(data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      type: typeEnum,
      merchant: data.merchant,
      paymentMethod: pm,
      isRecurring: data.isRecurring
    });
  }

  setTransactionType(type: TransactionType) {
    this.transactionType.set(type);
    this.form.patchValue({ type, categoryId: '' });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.file = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.form.valid) {
      const val = this.form.value;
      const dateValue = val.date ? new Date(val.date as any) : new Date();

      const dto = {
        amount: val.amount!,
        categoryId: val.categoryId!,
        description: val.description!,
        date: dateValue.toISOString(),
        type: val.type!,
        merchant: val.merchant || '',
        paymentMethod: val.paymentMethod!,
        isRecurring: val.isRecurring || false,
        receiptImage: this.file || undefined
      };

      const request$: Observable<unknown> = this.editMode && this.transactionData?.id
        ? this.transactionService.updateTransaction(this.transactionData.id, dto)
        : this.transactionService.createTransaction(dto);

      request$.subscribe({
        next: () => {
          this.transactionAdded.emit();
          this.resetForm();
        },
        error: (err: any) => {
          console.error('Error saving transaction', err);
        }
      });
    }
  }

  private resetForm() {
    this.form.reset({
      date: new Date().toISOString().split('T')[0],
      type: TransactionType.Expense,
      paymentMethod: PaymentMethod.Cash
    });
    this.file = null;
    this.previewUrl = null;
    this.transactionType.set(TransactionType.Expense);
  }

  onCancel() {
    this.cancel.emit();
  }
}
