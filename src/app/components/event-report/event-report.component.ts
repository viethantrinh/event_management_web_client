import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, finalize, of } from 'rxjs';
import { EventReportResponse } from '../../models/report.model';
import { ReportService } from '../../services/report.service';

@Component({
    selector: 'app-event-report',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './event-report.component.html',
    styleUrls: ['./event-report.component.css']
})
export class EventReportComponent implements OnInit, OnChanges {
    @Input() eventId: number = 0;
    @Input() isVisible: boolean = false;
    @Output() onClose = new EventEmitter<void>();

    private readonly reportService = inject(ReportService);

    // Signals
    public eventReport = signal<EventReportResponse | null>(null);
    public loading = signal<boolean>(false);
    public error = signal<string>('');
    public searchTerm = signal<string>('');
    public sortBy = signal<'fullName' | 'dutyName' | 'score'>('fullName');
    public sortDirection = signal<'asc' | 'desc'>('asc');
    public dutyFilter = signal<string>('');

    // Computed properties
    public filteredAndSortedParticipants = computed(() => {
        const report = this.eventReport();
        if (!report) return [];

        let participants = [...report.participants];

        // Filter by search term
        const search = this.searchTerm().toLowerCase();
        if (search) {
            participants = participants.filter(p =>
                p.fullName.toLowerCase().includes(search) ||
                p.dutyName.toLowerCase().includes(search)
            );
        }

        // Filter by duty
        const dutyFilter = this.dutyFilter();
        if (dutyFilter) {
            participants = participants.filter(p => p.dutyName === dutyFilter);
        }

        // Sort participants
        const sortBy = this.sortBy();
        const direction = this.sortDirection();

        participants.sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
                case 'fullName':
                    comparison = a.fullName.localeCompare(b.fullName);
                    break;
                case 'dutyName':
                    comparison = a.dutyName.localeCompare(b.dutyName);
                    break;
                case 'score':
                    comparison = a.score - b.score;
                    break;
            }

            return direction === 'asc' ? comparison : -comparison;
        });

        return participants;
    });

    public averageScore = computed(() => {
        const report = this.eventReport();
        if (!report || report.totalParticipants === 0) return 0;
        const totalScore = report.participants.reduce((sum, p) => sum + p.score, 0);
        return Math.round((totalScore / report.totalParticipants) * 100) / 100;
    });

    public uniqueDuties = computed(() => {
        const report = this.eventReport();
        if (!report) return [];
        return Object.keys(report.dutyDistribution);
    });

    public topDuty = computed(() => {
        const report = this.eventReport();
        if (!report) return null;

        let maxCount = 0;
        let topDuty = '';

        for (const [duty, count] of Object.entries(report.dutyDistribution)) {
            if (count > maxCount) {
                maxCount = count;
                topDuty = duty;
            }
        }

        return { duty: topDuty, count: maxCount };
    });

    public scoreStats = computed(() => {
        const report = this.eventReport();
        if (!report) return { highest: 0, lowest: 0 };

        const scores = report.participants.map(p => p.score);
        return {
            highest: Math.max(...scores),
            lowest: Math.min(...scores)
        };
    });

    public activeParticipationRate = computed(() => {
        const report = this.eventReport();
        if (!report) return 0;

        const activeParticipants = report.participants.filter(p =>
            p.dutyName.toLowerCase().includes('tích cực') ||
            p.dutyName.toLowerCase().includes('chủ trì')
        ).length;

        return Math.round((activeParticipants / report.totalParticipants) * 100);
    });

    ngOnInit(): void {
        if (this.eventId && this.isVisible) {
            this.loadEventReport();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['isVisible'] && this.isVisible && this.eventId) {
            this.resetComponent();
            this.loadEventReport();
        } else if (changes['eventId'] && this.eventId && this.isVisible) {
            this.resetComponent();
            this.loadEventReport();
        }
    }

    public loadEventReport(): void {
        if (!this.eventId) return;

        this.loading.set(true);
        this.error.set('');

        this.reportService.getEventReport(this.eventId)
            .pipe(
                catchError(error => {
                    console.error('Error loading event report:', error);
                    this.error.set('Không thể tải báo cáo sự kiện. Vui lòng thử lại.');
                    return of(null);
                }),
                finalize(() => this.loading.set(false))
            )
            .subscribe(report => {
                this.eventReport.set(report);
            });
    }

    public closeModal(): void {
        this.onClose.emit();
        this.resetComponent();
    }

    private resetComponent(): void {
        this.eventReport.set(null);
        this.error.set('');
        this.searchTerm.set('');
        this.sortBy.set('fullName');
        this.sortDirection.set('asc');
        this.dutyFilter.set('');
    }

    public onSearch(term: string): void {
        this.searchTerm.set(term);
    }

    public onDutyFilter(duty: string): void {
        this.dutyFilter.set(duty);
    }

    public onSort(field: 'fullName' | 'dutyName' | 'score'): void {
        if (this.sortBy() === field) {
            this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
        } else {
            this.sortBy.set(field);
            this.sortDirection.set(field === 'score' ? 'desc' : 'asc');
        }
    }

    public formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    }

    public exportToPDF(): void {
        window.print();
    }

    public getSortIcon(field: 'fullName' | 'dutyName' | 'score'): string {
        if (this.sortBy() !== field) return 'fas fa-sort';
        return this.sortDirection() === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
    }
}
