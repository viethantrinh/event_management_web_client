import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, inject, Input, OnChanges, OnInit, Output, signal, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, finalize, of, Subject } from 'rxjs';
import * as XLSX from 'xlsx';
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
        // Hiển thị loading cho việc xuất Excel
        const originalLoading = this.loading();
        this.loading.set(true);

        // Gọi API để lấy TOÀN BỘ dữ liệu (không filter, không phân trang)
        this.reportService.getOverviewReport()
            .pipe(
                catchError(error => {
                    console.error('Error exporting Excel:', error);
                    this.error.set('Không thể xuất file Excel. Vui lòng thử lại.');
                    return of([]);
                }),
                finalize(() => this.loading.set(originalLoading))
            )
            .subscribe(allData => {
                if (allData.length === 0) {
                    this.error.set('Không có dữ liệu để xuất Excel');
                    return;
                }

                this.generateSimpleExcelFile(allData);
            });
    }

    private generateSimpleExcelFile(allData: OverviewReportUser[]): void {
        // Tạo data theo định dạng đơn giản như CSV
        const worksheetData = [
            ['Số thứ tự', 'Họ và tên', 'Học hàm', 'Học vị', 'Tổng số sự kiện đã tham gia', 'Tổng số điểm']
        ];

        // Thêm toàn bộ dữ liệu người dùng (sắp xếp theo sequenceNumber)
        const sortedData = [...allData].sort((a, b) => a.sequenceNumber - b.sequenceNumber);

        sortedData.forEach(user => {
            worksheetData.push([
                user.sequenceNumber.toString(),
                user.fullName || '',
                user.department || '',
                user.degree || '',
                user.totalEventsParticipated.toString(),
                user.totalScore.toString()
            ]);
        });

        // Tạo workbook và worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

        // Thiết lập độ rộng cột
        const columnWidths = [
            { wch: 12 }, // Số thứ tự
            { wch: 25 }, // Họ và tên
            { wch: 20 }, // Học hàm
            { wch: 15 }, // Học vị
            { wch: 30 }, // Tổng số sự kiện đã tham gia
            { wch: 18 }  // Tổng số điểm
        ];
        worksheet['!cols'] = columnWidths;

        // Style cho header row (màu vàng theo yêu cầu)
        const headerRange = XLSX.utils.decode_range('A1:F1');
        for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
            if (!worksheet[cellAddress]) worksheet[cellAddress] = {};
            worksheet[cellAddress].s = {
                font: { bold: true, color: { rgb: "000000" } },
                fill: { fgColor: { rgb: "FFD700" } },
                alignment: { horizontal: "center", vertical: "center" },
                border: {
                    top: { style: "thin", color: { rgb: "000000" } },
                    bottom: { style: "thin", color: { rgb: "000000" } },
                    left: { style: "thin", color: { rgb: "000000" } },
                    right: { style: "thin", color: { rgb: "000000" } }
                }
            };
        }

        // Style cho các dòng dữ liệu (zebra striping như trong bảng)
        for (let row = 1; row <= sortedData.length; row++) {
            const isEvenRow = row % 2 === 0;
            const fillColor = isEvenRow ? "F8F9FA" : "FFFFFF";

            for (let col = 0; col < 6; col++) {
                const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
                if (!worksheet[cellAddress]) worksheet[cellAddress] = {};
                worksheet[cellAddress].s = {
                    fill: { fgColor: { rgb: fillColor } },
                    border: {
                        top: { style: "thin", color: { rgb: "CCCCCC" } },
                        bottom: { style: "thin", color: { rgb: "CCCCCC" } },
                        left: { style: "thin", color: { rgb: "CCCCCC" } },
                        right: { style: "thin", color: { rgb: "CCCCCC" } }
                    },
                    alignment: {
                        horizontal: col === 0 || col >= 4 ? "center" : "left",
                        vertical: "center"
                    }
                };
            }
        }

        // Thêm worksheet vào workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Báo cáo tổng thể');

        // Xuất file Excel
        const fileName = `bao-cao-tong-the-${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    }

    public exportToPDF(): void {
        window.print();
    }
}
