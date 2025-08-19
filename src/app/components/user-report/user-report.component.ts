import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, finalize, of } from 'rxjs';
import { UserReportResponse } from '../../models/report.model';
import { ReportService } from '../../services/report.service';

@Component({
    selector: 'app-user-report',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './user-report.component.html',
    styleUrls: ['./user-report.component.css']
})
export class UserReportComponent implements OnInit, OnChanges {
    @Input() userId: string = '';
    @Input() isVisible: boolean = false;
    @Output() onClose = new EventEmitter<void>();

    private readonly reportService = inject(ReportService);

    // Signals
    public userReport = signal<UserReportResponse | null>(null);
    public loading = signal<boolean>(false);
    public error = signal<string>('');
    public searchTerm = signal<string>('');
    public sortBy = signal<'eventName' | 'startDate' | 'score'>('startDate');
    public sortDirection = signal<'asc' | 'desc'>('desc');

    // Computed properties
    public filteredAndSortedEvents = computed(() => {
        const report = this.userReport();
        if (!report) return [];

        let events = [...report.eventParticipations];

        // Filter by search term
        const search = this.searchTerm().toLowerCase();
        if (search) {
            events = events.filter(event =>
                event.eventName.toLowerCase().includes(search) ||
                event.dutyName.toLowerCase().includes(search)
            );
        }

        // Sort events
        const sortBy = this.sortBy();
        const direction = this.sortDirection();

        events.sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
                case 'eventName':
                    comparison = a.eventName.localeCompare(b.eventName);
                    break;
                case 'startDate':
                    comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
                    break;
                case 'score':
                    comparison = a.score - b.score;
                    break;
            }

            return direction === 'asc' ? comparison : -comparison;
        });

        return events;
    });

    public averageScore = computed(() => {
        const report = this.userReport();
        if (!report || report.totalEvents === 0) return 0;
        return Math.round((report.totalScore / report.totalEvents) * 100) / 100;
    });

    ngOnInit(): void {
        if (this.userId && this.isVisible) {
            this.loadUserReport();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['isVisible'] && this.isVisible && this.userId) {
            this.resetComponent();
            this.loadUserReport();
        } else if (changes['userId'] && this.userId && this.isVisible) {
            this.resetComponent();
            this.loadUserReport();
        }
    }

    public loadUserReport(): void {
        if (!this.userId) return;

        this.loading.set(true);
        this.error.set('');

        this.reportService.getUserReport(this.userId)
            .pipe(
                catchError(error => {
                    console.error('Error loading user report:', error);
                    this.error.set('Không thể tải báo cáo người dùng. Vui lòng thử lại.');
                    return of(null);
                }),
                finalize(() => this.loading.set(false))
            )
            .subscribe(report => {
                this.userReport.set(report);
            });
    }

    public closeModal(): void {
        this.onClose.emit();
        this.resetComponent();
    }

    private resetComponent(): void {
        this.userReport.set(null);
        this.error.set('');
        this.searchTerm.set('');
        this.sortBy.set('startDate');
        this.sortDirection.set('desc');
    }

    public onSearch(term: string): void {
        this.searchTerm.set(term);
    }

    public onSort(field: 'eventName' | 'startDate' | 'score'): void {
        if (this.sortBy() === field) {
            // Toggle direction if same field
            this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
        } else {
            // Set new field and default direction
            this.sortBy.set(field);
            this.sortDirection.set(field === 'score' ? 'desc' : 'asc');
        }
    }

    public formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    }

    public formatDateRange(startDate: string, endDate: string): string {
        const start = this.formatDate(startDate);
        const end = this.formatDate(endDate);
        return start === end ? start : `${start} - ${end}`;
    }

    public exportToPDF(): void {
        window.print();
    }

    public getSortIcon(field: 'eventName' | 'startDate' | 'score'): string {
        if (this.sortBy() !== field) return 'fas fa-sort';
        return this.sortDirection() === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
    }
}
