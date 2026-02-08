import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService, Category, CreateCategoryDto } from '../../core/services/category.service';
import { NgClass } from '@angular/common';

// Popular Material Icons for categories
const POPULAR_ICONS = [
    { name: 'restaurant', label: 'Food' },
    { name: 'home', label: 'Home' },
    { name: 'directions_car', label: 'Car' },
    { name: 'shopping_cart', label: 'Shopping' },
    { name: 'movie', label: 'Entertainment' },
    { name: 'medical_services', label: 'Health' },
    { name: 'bolt', label: 'Utilities' },
    { name: 'payments', label: 'Payments' },
    { name: 'work', label: 'Work' },
    { name: 'school', label: 'Education' },
    { name: 'flight', label: 'Travel' },
    { name: 'fitness_center', label: 'Fitness' },
    { name: 'pets', label: 'Pets' },
    { name: 'phone_iphone', label: 'Phone' },
    { name: 'wifi', label: 'Internet' },
    { name: 'local_gas_station', label: 'Fuel' },
    { name: 'receipt', label: 'Bills' },
    { name: 'savings', label: 'Savings' },
    { name: 'account_balance', label: 'Bank' },
    { name: 'card_giftcard', label: 'Gifts' }
];

const PRESET_COLORS = [
    '#EF4444', '#F59E0B', '#10B981', '#06B6D4', '#3B82F6',
    '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#84CC16',
    '#6366F1', '#A855F7', '#D946EF', '#F43F5E', '#64748B'
];

// Extended interface to include the isDeletable flag
interface CategoryWithFlags extends Category {
    isDeletable: boolean;
}

@Component({
    selector: 'app-categories',
    standalone: true,
    imports: [ReactiveFormsModule, NgClass],
    templateUrl: './categories.component.html',
    styleUrl: './categories.component.css'
})
export class CategoriesComponent implements OnInit {
    private categoryService = inject(CategoryService);
    private fb = inject(FormBuilder);

    categories = signal<CategoryWithFlags[]>([]);
    loading = signal(false);
    showModal = signal(false);
    showDeleteModal = signal(false);
    categoryToDelete = signal<string | null>(null);

    popularIcons = POPULAR_ICONS;
    presetColors = PRESET_COLORS;

    categoryForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(2)]],
        icon: ['restaurant', Validators.required],
        color: ['#EF4444', Validators.required],
        type: [0, Validators.required] // Default to Expense
    });

    incomeCategories = computed(() =>
        this.categories().filter(c => c.type === 1).sort((a, b) => a.name.localeCompare(b.name))
    );

    expenseCategories = computed(() =>
        this.categories().filter(c => c.type === 0).sort((a, b) => a.name.localeCompare(b.name))
    );

    ngOnInit() {
        this.loadCategories();
    }

    loadCategories() {
        this.loading.set(true);
        // List of default categories that cannot be deleted
        const defaultCategoryNames = [
            'Food', 'Salary', 'Rent', 'Shopping',
            'Transport', 'Entertainment', 'Health', 'Utilities'
        ];

        this.categoryService.getAll().subscribe({
            next: (categories) => {
                // Add isDeletable flag to each category
                // A category is deletable if its name is NOT in the default list
                const categoriesWithFlags = categories.map(cat => ({
                    ...cat,
                    isDeletable: !defaultCategoryNames.includes(cat.name)
                }));
                this.categories.set(categoriesWithFlags);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading categories:', err);
                this.loading.set(false);
            }
        });
    }

    openModal() {
        this.categoryForm.reset({
            icon: 'restaurant',
            color: '#EF4444',
            type: 0
        });
        this.showModal.set(true);
    }

    closeModal() {
        this.showModal.set(false);
        this.categoryForm.reset();
    }

    selectIcon(icon: string) {
        this.categoryForm.patchValue({ icon });
    }

    selectColor(color: string) {
        this.categoryForm.patchValue({ color });
    }

    onSubmit() {
        if (this.categoryForm.valid) {
            const formValue = this.categoryForm.value;
            const categoryData: CreateCategoryDto = {
                name: formValue.name!,
                icon: formValue.icon!,
                color: formValue.color!,
                type: formValue.type!
            };

            this.categoryService.create(categoryData).subscribe({
                next: () => {
                    this.closeModal();
                    this.loadCategories();
                },
                error: (err: any) => {
                    console.error('Error creating category:', err);
                    alert('Failed to create category');
                }
            });
        }
    }

    confirmDelete(id: string) {
        this.categoryToDelete.set(id);
        this.showDeleteModal.set(true);
    }

    cancelDelete() {
        this.showDeleteModal.set(false);
        this.categoryToDelete.set(null);
    }

    deleteCategory() {
        const id = this.categoryToDelete();
        if (id) {
            this.categoryService.delete(id).subscribe({
                next: () => {
                    this.cancelDelete();
                    this.loadCategories();
                },
                error: (err: any) => {
                    console.error('Error deleting category:', err);
                    alert('Failed to delete category');
                }
            });
        }
    }

    get selectedIcon(): string {
        return this.categoryForm.get('icon')?.value || 'restaurant';
    }

    get selectedColor(): string {
        return this.categoryForm.get('color')?.value || '#EF4444';
    }
}
