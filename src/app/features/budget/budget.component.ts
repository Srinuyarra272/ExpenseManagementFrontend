import { Component, inject, signal, effect, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BudgetService, BudgetDto } from '../../core/services/budget.service';
import { CategoryService } from '../../core/services/category.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { TransactionType } from '../../core/services/transaction.service';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
    ApexAxisChartSeries,
    ApexChart,
    ApexXAxis,
    ApexTitleSubtitle,
    ApexDataLabels,
    ApexPlotOptions,
    ApexLegend
} from "ng-apexcharts";

export type ChartOptions = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    title: ApexTitleSubtitle;
    dataLabels: ApexDataLabels;
    plotOptions: ApexPlotOptions;
    legend: ApexLegend;
};

@Component({
    selector: 'app-budget',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, NgApexchartsModule],
    templateUrl: './budget.component.html',
    styleUrl: './budget.component.css'
})
export class BudgetComponent {
    private budgetService = inject(BudgetService);
    private categoryService = inject(CategoryService);
    private fb = inject(FormBuilder);

    currentDate = signal(new Date());
    budgets = signal<BudgetDto[]>([]);
    categories = toSignal(this.categoryService.getAll(), { initialValue: [] });

    chartOptions: Partial<ChartOptions> | any;

    showAddModal = signal(false);
    editingBudget = signal<BudgetDto | null>(null);

    budgetForm = this.fb.group({
        categoryId: ['', Validators.required],
        amount: [0, [Validators.required, Validators.min(1)]]
    });

    totalBudget = computed(() => this.budgets().reduce((acc, b) => acc + b.amount, 0));
    totalSpent = computed(() => this.budgets().reduce((acc, b) => acc + b.spent, 0));

    constructor() {
        effect(() => {
            this.loadBudgets();
        });

        effect(() => {
            this.updateChart();
        });
    }

    loadBudgets() {
        const date = this.currentDate();
        this.budgetService.getBudgets(date.getMonth() + 1, date.getFullYear()).subscribe({
            next: (data) => this.budgets.set(data),
            error: (err) => console.error(err)
        });
    }

    updateChart() {
        const data = this.budgets();
        this.chartOptions = {
            series: [
                {
                    name: "Budget",
                    data: data.map(b => b.amount)
                },
                {
                    name: "Spent",
                    data: data.map(b => b.spent)
                }
            ],
            chart: {
                type: "bar",
                height: 350,
                fontFamily: 'inherit',
                toolbar: { show: false },
                animations: {
                    enabled: true,
                    easing: 'easeinout',
                    speed: 800,
                    animateGradually: {
                        enabled: true,
                        delay: 150
                    },
                    dynamicAnimation: {
                        enabled: true,
                        speed: 350
                    }
                }
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '50%',
                    borderRadius: 8,
                    borderRadiusApplication: 'end',
                },
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                show: true,
                width: 2,
                colors: ['transparent']
            },
            xaxis: {
                categories: data.map(b => b.categoryName),
                axisBorder: { show: false },
                axisTicks: { show: false },
                labels: {
                    style: {
                        colors: '#64748b',
                        fontSize: '12px',
                        fontWeight: 500
                    }
                }
            },
            yaxis: {
                labels: {
                    style: {
                        colors: '#64748b',
                        fontSize: '12px',
                        fontWeight: 500
                    },
                    formatter: (val: number) => {
                        // Format as 1k, 1.5k etc if large, otherwise simple currency
                        return val >= 1000 ? '$' + (val / 1000).toFixed(1) + 'k' : '$' + val.toFixed(0);
                    }
                }
            },
            grid: {
                borderColor: '#e2e8f0',
                strokeDashArray: 6,
                yaxis: {
                    lines: {
                        show: true
                    }
                },
                xaxis: {
                    lines: {
                        show: false
                    }
                },
                padding: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 10
                }
            },
            legend: {
                position: 'bottom',
                horizontalAlign: 'center',
                offsetY: 8,
                markers: {
                    radius: 12, // User requested 'card legend', making markers circular circles matches modern UI
                    width: 10,
                    height: 10
                },
                itemMargin: {
                    horizontal: 10,
                    vertical: 0
                }
            },
            tooltip: {
                theme: 'light', // Matching the clean white look of the reference
                y: {
                    formatter: function (val: number) {
                        return "$" + val.toFixed(2);
                    }
                },
                style: {
                    fontSize: '12px',
                    fontFamily: 'inherit'
                },
                marker: {
                    show: true,
                },
                onDatasetHover: {
                    highlightDataSeries: true,
                },
                // Add a subtle shadow to match reference
            },
            fill: {
                opacity: 1
            },
            colors: ['#4f46e5', '#ef4444'] // Indigo-600 and Red-500
        };
    }

    changeMonth(delta: number) {
        const newDate = new Date(this.currentDate());
        newDate.setMonth(newDate.getMonth() + delta);
        this.currentDate.set(newDate);
    }

    openAddModal() {
        this.editingBudget.set(null);
        this.budgetForm.reset({ amount: 0 });
        this.showAddModal.set(true);
    }

    editBudget(budget: BudgetDto) {
        this.editingBudget.set(budget);
        this.budgetForm.patchValue({
            categoryId: budget.categoryId,
            amount: budget.amount
        });
        this.budgetForm.controls.categoryId.disable(); // Cannot change category when editing
        this.showAddModal.set(true);
    }

    closeModal() {
        this.showAddModal.set(false);
        this.budgetForm.reset();
        this.budgetForm.controls.categoryId.enable();
    }

    showDeleteModal = signal(false);
    budgetToDelete = signal<string | null>(null);

    confirmDelete(id: string) {
        this.budgetToDelete.set(id);
        this.showDeleteModal.set(true);
    }

    cancelDelete() {
        this.showDeleteModal.set(false);
        this.budgetToDelete.set(null);
    }

    deleteBudget() {
        const id = this.budgetToDelete();
        if (!id) return;

        this.budgetService.deleteBudget(id).subscribe({
            next: () => {
                this.loadBudgets();
                this.cancelDelete();
            },
            error: (err) => {
                console.error('Error deleting budget:', err);
                alert('Failed to delete budget');
                this.cancelDelete();
            }
        });
    }

    onSubmit() {
        if (this.budgetForm.invalid) return;

        const val = this.budgetForm.getRawValue();
        const date = this.currentDate();

        const observer = {
            next: () => {
                this.closeModal();
                this.loadBudgets();
            },
            error: (err: any) => {
                console.error('Error saving budget:', err);
                alert('Failed to save budget');
            }
        };

        if (this.editingBudget()) {
            this.budgetService.updateBudget(this.editingBudget()!.id, val.amount!).subscribe(observer);
        } else {
            this.budgetService.createBudget({
                categoryId: val.categoryId!,
                amount: val.amount!,
                month: date.getMonth() + 1,
                year: date.getFullYear()
            }).subscribe(observer);
        }
    }

    get availableCategories() {
        // Filter out categories that already have a budget for this month (unless we are editing that one)
        const existingIds = this.budgets().map(b => b.categoryId);
        return this.categories().filter(c => !existingIds.includes(c.id) && c.type === TransactionType.Expense);
    }
}
