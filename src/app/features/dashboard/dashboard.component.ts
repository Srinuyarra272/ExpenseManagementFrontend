import { Component, inject, OnInit, effect } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DashboardService, DashboardMetrics } from '../../core/services/dashboard.service';
import { BudgetService, BudgetDto } from '../../core/services/budget.service';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ThemeService } from '../../core/services/theme.service';


import {
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart,
  ApexAxisChartSeries,
  ApexXAxis,
  ApexStroke,
  ApexTooltip,
  ApexDataLabels,
  ApexLegend,
  ApexGrid,
  ApexYAxis,
  ApexTitleSubtitle,
  ApexFill,
  ApexMarkers
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
  legend: ApexLegend;
  markers: ApexMarkers;
  grid: ApexGrid;
  yaxis: ApexYAxis;
  title: ApexTitleSubtitle;
  fill: ApexFill;
  colors: string[];
  responsive: ApexResponsive[];
  labels: any;
  plotOptions: any;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    AsyncPipe, CurrencyPipe, DatePipe, DecimalPipe, NgClass, RouterLink,
    NgApexchartsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private budgetService = inject(BudgetService);
  private router = inject(Router);
  private themeService = inject(ThemeService);

  // Using standard properties instead of signals
  metrics: DashboardMetrics | null = null;
  loading: boolean = false;
  currentDate: Date = new Date();

  pieChartOptions: Partial<ChartOptions> | any;
  chartOptions: Partial<ChartOptions> | any; // Spending Activity
  budgetChartOptions: Partial<ChartOptions> | any; // Budget vs Spent

  budgets: BudgetDto[] = [];

  constructor() {
    effect(() => {
      // Register dependency on theme changes
      this.themeService.darkMode();

      // Trigger chart update when theme changes
      if (this.metrics) {
        this.updateChartOptions();
      }
      if (this.budgets.length > 0) {
        this.updateBudgetChartOptions();
      }
    });
  }

  ngOnInit() {
    this.loadMetrics();
    this.initMainChart();
  }

  get currentMonthName(): string {
    return this.currentDate.toLocaleString('default', { month: 'long' });
  }

  get currentYear(): number {
    return this.currentDate.getFullYear();
  }

  get isFutureDate(): boolean {
    const today = new Date();
    return this.currentDate.getFullYear() > today.getFullYear() ||
      (this.currentDate.getFullYear() === today.getFullYear() && this.currentDate.getMonth() >= today.getMonth());
  }

  changeMonth(delta: number) {
    const newDate = new Date(this.currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    this.currentDate = newDate;
    this.loadMetrics();
  }

  private loadMetrics() {
    this.loading = true;
    this.dashboardService.getMetrics(this.currentDate.getMonth() + 1, this.currentDate.getFullYear()).subscribe({
      next: (data) => {
        // Overwrite colors for premium monochrome look
        const monoPalette = ['#0f172a', '#334155', '#475569', '#64748b', '#94a3b8'];
        if (data && data.topCategories) {
          data.topCategories.forEach((cat, index) => {
            cat.color = monoPalette[index % monoPalette.length];
          });
        }
        this.metrics = data;
        this.updateChartOptions();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard metrics:', err);
        this.metrics = null;
        this.loading = false;

        if (err.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });

    // Load Budgets for Analysis
    this.budgetService.getBudgets(this.currentDate.getMonth() + 1, this.currentDate.getFullYear()).subscribe({
      next: (data) => {
        this.budgets = data;
        this.updateBudgetChartOptions();
      },
      error: (err) => console.error('Error loading budgets', err)
    });
  }

  private initMainChart() {
    this.chartOptions = {
      series: [{ name: "Daily Spending", data: [] }],
      chart: {
        height: 350,
        type: "area",
        zoom: { enabled: false },
        toolbar: { show: false }
      },
      dataLabels: { enabled: false },
      stroke: { curve: "smooth" },
      title: { text: "", align: "left" },
      xaxis: { categories: [] },
      colors: ["#6366f1"]
    };
  }

  private updateChartOptions() {
    const isDark = this.themeService.darkMode();
    const data = this.metrics?.topCategories || [];

    // Pie Chart - Limit to top 5 for readability
    const pieData = data.slice(0, 5);
    this.pieChartOptions = {
      series: pieData.map(d => d.value),
      chart: {
        type: "donut",
        height: 250,
        animations: { enabled: true },
        foreColor: isDark ? '#cbd5e1' : '#374151'
      },
      labels: pieData.map(d => d.name),
      colors: isDark
        ? ['#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#475569'] // Lighter grayscale for dark mode
        : ['#0f172a', '#334155', '#475569', '#64748b', '#94a3b8'], // Darker grayscale for light mode
      stroke: {
        show: true,
        colors: isDark ? ['#1e293b'] : ['#ffffff'] // Border color matches card bg
      },
      legend: {
        labels: {
          colors: isDark ? '#cbd5e1' : '#374151'
        }
      },
      responsive: [
        {
          breakpoint: 1440,
          options: {
            legend: {
              show: false
            }
          }
        },
        {
          breakpoint: 1024,
          options: {
            legend: {
              show: true,
              position: 'bottom'
            }
          }
        },
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: "bottom"
            }
          }
        }
      ]
    };

    // Update Main Chart (Daily Trends)
    const trends = this.metrics?.dailyTrends || [];
    const categories = trends.map(t => new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    const seriesData = trends.map(t => t.dailyAmount);

    const gridColor = isDark ? '#334155' : '#f3f4f6';
    const labelColor = isDark ? '#94a3b8' : '#9ca3af';

    this.chartOptions = {
      series: [{
        name: "Daily Spending",
        data: seriesData
      }],
      chart: {
        height: "100%",
        type: "area",
        fontFamily: 'Inter, system-ui, sans-serif',
        zoom: { enabled: false },
        toolbar: { show: false },
        foreColor: labelColor
      },
      dataLabels: { enabled: false },
      stroke: {
        curve: "smooth",
        width: 3
      },
      title: {
        text: "",
        align: "left",
        style: {
          fontSize: '16px',
          fontWeight: 600,
          color: isDark ? '#f1f5f9' : '#374151'
        }
      },
      grid: {
        show: true,
        borderColor: gridColor,
        strokeDashArray: 4,
        xaxis: {
          lines: { show: false }
        },
        yaxis: {
          lines: { show: true }
        },
        padding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 10
        }
      },
      xaxis: {
        categories: categories,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: {
            colors: labelColor,
            fontSize: '12px',
            fontWeight: 500
          }
        },
        tooltip: { enabled: false }
      },
      yaxis: {
        show: true,
        labels: {
          style: {
            colors: labelColor,
            fontSize: '12px',
            fontWeight: 500
          },
          formatter: (value: number) => {
            return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : `${value}`;
          }
        }
      },
      colors: isDark ? ["#94a3b8"] : ["#334155"],
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          stops: [0, 100]
        }
      },
      tooltip: {
        theme: isDark ? 'dark' : 'light',
        custom: ({ series, seriesIndex, dataPointIndex, w }: any) => {
          const value = series[seriesIndex][dataPointIndex];

          const bg = isDark ? '#1e293b' : '#ffffff';
          const border = isDark ? '#334155' : '#f3f4f6';
          const titleColor = isDark ? '#94a3b8' : '#9ca3af';
          const valueColor = isDark ? '#f8fafc' : '#111827';

          return `
            <div style="background: ${bg}; padding: 12px 16px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); font-family: inherit; border: 1px solid ${border};">
              <div style="margin-bottom: 4px; color: ${titleColor}; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.025em;">
                ${categories[dataPointIndex]}
              </div>
              <div style="display: flex; align-items: baseline; gap: 4px;">
                <span style="font-size: 1.125rem; font-weight: 700; color: ${valueColor};">₹${value}</span>
                <span style="font-size: 0.75rem; color: #6b7280; font-weight: 500;">spent</span>
              </div>
            </div>
          `;
        }
      }
    };
  }

  private updateBudgetChartOptions() {
    const isDark = this.themeService.darkMode();
    const data = this.budgets;
    const labelColor = isDark ? '#94a3b8' : '#9ca3af';
    const gridColor = isDark ? '#334155' : '#f3f4f6';

    const categories = data.map(b => b.categoryName);

    // Calculate dynamic colors for Spent bars
    const budgetData = data.map(b => b.amount);
    const spentData = data.map(b => b.spent);

    const spentColors = spentData.map((spent, index) => {
      const budget = budgetData[index];
      // If spent >= budget, use red/danger color, otherwise use standard slate color
      if (spent >= budget) {
        return isDark ? '#ef4444' : '#dc2626'; // Red-500/600
      }
      return isDark ? '#e2e8f0' : '#94a3b8'; // Standard Spent Color
    });

    this.budgetChartOptions = {
      series: [
        {
          name: "Budget",
          data: budgetData
        },
        {
          name: "Spent",
          data: spentData
        }
      ],
      chart: {
        type: "bar",
        height: 350,
        fontFamily: 'Inter, system-ui, sans-serif',
        toolbar: { show: false },
        foreColor: labelColor
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '50%',
          borderRadius: 4,
          distributed: false // Important: we control colors via the colors array mapping
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
        categories: categories,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: {
            colors: labelColor,
            fontSize: '12px',
            fontWeight: 500
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: labelColor,
            fontSize: '12px',
            fontWeight: 500
          },
          formatter: (val: number) => {
            return val >= 1000 ? '₹' + (val / 1000).toFixed(1) + 'k' : '₹' + val.toFixed(0);
          }
        }
      },
      grid: {
        borderColor: gridColor,
        strokeDashArray: 4,
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
        position: 'top',
        horizontalAlign: 'right',
        offsetY: 0,
        itemMargin: {
          horizontal: 10,
          vertical: 0
        },
        labels: {
          colors: isDark ? '#cbd5e1' : '#374151'
        },
        markers: {
          fillColors: isDark ? ['#64748b', '#e2e8f0'] : ['#1e293b', '#94a3b8'] // Default legend colors
        }
      },
      fill: {
        opacity: 1
      },
      colors: [
        function ({ seriesIndex, dataPointIndex, w }: any) {
          // Series 0 is Budget
          if (seriesIndex === 0) {
            return isDark ? '#64748b' : '#1e293b';
          }
          // Series 1 is Spent - use our dynamic array
          return spentColors[dataPointIndex];
        }
      ],
      tooltip: {
        theme: isDark ? 'dark' : 'light',
        custom: ({ series, seriesIndex, dataPointIndex, w }: any) => {
          const value = series[seriesIndex][dataPointIndex];
          const seriesName = w.globals.seriesNames[seriesIndex];
          const category = categories[dataPointIndex];

          // Determine color for the value text
          let valueColor = isDark ? '#f8fafc' : '#111827';

          if (seriesName === 'Spent') {
            // Use the calculated color for consistency (e.g. red if over budget)
            valueColor = spentColors[dataPointIndex];
          }

          const bg = isDark ? '#1e293b' : '#ffffff';
          const border = isDark ? '#334155' : '#f3f4f6';
          const titleColor = isDark ? '#94a3b8' : '#9ca3af';

          return `
            <div style="background: ${bg}; padding: 12px 16px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); font-family: inherit; border: 1px solid ${border};">
              <div style="margin-bottom: 4px; color: ${titleColor}; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.025em;">
                ${category}
              </div>
              <div style="display: flex; align-items: baseline; gap: 4px;">
                <span style="font-size: 1.125rem; font-weight: 700; color: ${valueColor};">₹${value}</span>
                <span style="font-size: 0.75rem; color: #6b7280; font-weight: 500;">${seriesName.toLowerCase()}</span>
              </div>
            </div>
          `;
        }
      }
    };
  }
}
