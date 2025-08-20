import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, inject, Input, OnChanges, OnInit, Output, signal, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, finalize, of, Subject } from 'rxjs';
import { OverviewReportUser } from '../../models/report.model';
import { ReportService } from '../../services/report.service';

type SortableColumn = 'sequenceNumber' | 'fullName' | 'department' | 'degree' | 'totalEventsParticipated' | 'totalScore';

@Component({
    selector: 'app-overview-report',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './overview-report.component.html',
    styleUrls: ['./overview-report.component.css']
})
export class OverviewReportComponent implements OnInit, OnChanges {
    @Input() isVisible: boolean = false;
    @Output() onClose = new EventEmitter<void>();

    private readonly reportService = inject(ReportService);
    private searchSubject = new Subject<string>();

    // Signals
    public overviewData = signal<OverviewReportUser[]>([]);
    public loading = signal<boolean>(false);
    public error = signal<string>('');
    public searchTerm = signal<string>('');
    public departmentFilter = signal<string>('');
    public degreeFilter = signal<string>('');
    public sortBy = signal<SortableColumn>('totalScore');
    public sortDirection = signal<'asc' | 'desc'>('desc');
    public currentPage = signal<number>(1);
    public pageSize = signal<number>(50);

    // Computed properties
    public filteredData = computed(() => {
        let data = [...this.overviewData()];

        // Search filter
        const search = this.searchTerm().toLowerCase();
        if (search) {
            data = data.filter(user =>
                user.fullName.toLowerCase().includes(search) ||
                user.department.toLowerCase().includes(search)
            );
        }

        // Department filter
        const dept = this.departmentFilter();
        if (dept) {
            data = data.filter(user => user.department === dept);
        }

        // Degree filter
        const degree = this.degreeFilter();
        if (degree) {
            data = data.filter(user => user.degree === degree);
        }

        return data;
    });

    public sortedData = computed(() => {
        const data = [...this.filteredData()];
        const sortBy = this.sortBy();
        const direction = this.sortDirection();

        data.sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
                case 'sequenceNumber':
                    comparison = a.sequenceNumber - b.sequenceNumber;
                    break;
                case 'fullName':
                    comparison = a.fullName.localeCompare(b.fullName);
                    break;
                case 'department':
                    comparison = a.department.localeCompare(b.department);
                    break;
                case 'degree':
                    comparison = a.degree.localeCompare(b.degree);
                    break;
                case 'totalEventsParticipated':
                    comparison = a.totalEventsParticipated - b.totalEventsParticipated;
                    break;
                case 'totalScore':
                    comparison = a.totalScore - b.totalScore;
                    break;
            }

            return direction === 'asc' ? comparison : -comparison;
        });

        return data;
    });

    public paginatedData = computed(() => {
        const data = this.sortedData();
        const page = this.currentPage();
        const size = this.pageSize();
        const startIndex = (page - 1) * size;
        return data.slice(startIndex, startIndex + size);
    });

    public totalPages = computed(() => {
        return Math.ceil(this.sortedData().length / this.pageSize());
    });

    public pageNumbers = computed(() => {
        const total = this.totalPages();
        const current = this.currentPage();
        const pages: number[] = [];

        for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
            pages.push(i);
        }

        return pages;
    });

    // Statistics
    public statistics = computed(() => {
        const data = this.filteredData();
        if (data.length === 0) {
            return {
                totalUsers: 0,
                averageScore: 0,
                highestScore: 0,
                lowestScore: 0,
                highestScorer: '',
                lowestScorer: '',
                totalEvents: 0
            };
        }

        const scores = data.map(u => u.totalScore);
        const events = data.map(u => u.totalEventsParticipated);
        const highestScore = Math.max(...scores);
        const lowestScore = Math.min(...scores);
        const highestScorer = data.find(u => u.totalScore === highestScore)?.fullName || '';
        const lowestScorer = data.find(u => u.totalScore === lowestScore)?.fullName || '';

        return {
            totalUsers: data.length,
            averageScore: Math.round((scores.reduce((sum, score) => sum + score, 0) / data.length) * 100) / 100,
            highestScore,
            lowestScore,
            highestScorer,
            lowestScorer,
            totalEvents: events.reduce((sum, events) => sum + events, 0)
        };
    });

    public uniqueDepartments = computed(() => {
        const data = this.overviewData();
        const departments = new Set(data.map(u => u.department).filter(d => d.trim() !== ''));
        return Array.from(departments).sort();
    });

    public uniqueDegrees = computed(() => {
        const data = this.overviewData();
        const degrees = new Set(data.map(u => u.degree).filter(d => d.trim() !== ''));
        return Array.from(degrees).sort();
    });

    ngOnInit(): void {
        if (this.isVisible) {
            this.loadOverviewReport();
        }

        // Setup debounced search
        this.searchSubject.pipe(
            debounceTime(300),
            distinctUntilChanged()
        ).subscribe(searchTerm => {
            this.searchTerm.set(searchTerm);
            this.currentPage.set(1);
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['isVisible'] && this.isVisible) {
            this.resetComponent();
            this.loadOverviewReport();
        }
    }

    public loadOverviewReport(): void {
        this.loading.set(true);
        this.error.set('');

        this.reportService.getOverviewReport()
            .pipe(
                catchError(error => {
                    console.error('Error loading overview report:', error);
                    this.error.set('Không thể tải báo cáo tổng thể. Vui lòng thử lại.');
                    return of([]);
                }),
                finalize(() => this.loading.set(false))
            )
            .subscribe(data => {
                this.overviewData.set(data);
            });
    }

    public closeModal(): void {
        this.onClose.emit();
        this.resetComponent();
    }

    private resetComponent(): void {
        this.overviewData.set([]);
        this.error.set('');
        this.searchTerm.set('');
        this.departmentFilter.set('');
        this.degreeFilter.set('');
        this.sortBy.set('totalScore');
        this.sortDirection.set('desc');
        this.currentPage.set(1);
    }

    public onSearchInput(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.searchSubject.next(target.value);
    }

    public onDepartmentFilter(department: string): void {
        this.departmentFilter.set(department);
        this.currentPage.set(1);
    }

    public onDegreeFilter(degree: string): void {
        this.degreeFilter.set(degree);
        this.currentPage.set(1);
    }

    public onSort(column: SortableColumn): void {
        if (this.sortBy() === column) {
            this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
        } else {
            this.sortBy.set(column);
            this.sortDirection.set(column === 'totalScore' || column === 'totalEventsParticipated' ? 'desc' : 'asc');
        }
    }

    public goToPage(page: number): void {
        if (page >= 1 && page <= this.totalPages()) {
            this.currentPage.set(page);
        }
    }

    public clearFilters(): void {
        this.searchTerm.set('');
        this.departmentFilter.set('');
        this.degreeFilter.set('');
        this.currentPage.set(1);
    }

    public getSortIcon(column: SortableColumn): string {
        if (this.sortBy() !== column) return 'fas fa-sort';
        return this.sortDirection() === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
    }

    public exportToExcel(): void {
        // Implement Excel export functionality
        const data = this.sortedData();
        const headers = ['Số thứ tự', 'Họ và tên', 'Học hàm', 'Học vị', 'Tổng số sự kiện đã tham gia', 'Tổng số điểm'];

        let csvContent = headers.join(',') + '\n';
        data.forEach(user => {
            const row = [
                user.sequenceNumber,
                `"${user.fullName}"`,
                `"${user.department}"`,
                `"${user.degree}"`,
                user.totalEventsParticipated,
                user.totalScore
            ];
            csvContent += row.join(',') + '\n';
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `bao-cao-tong-the-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    public exportToPDF(): void {
        window.print();
    }
}
