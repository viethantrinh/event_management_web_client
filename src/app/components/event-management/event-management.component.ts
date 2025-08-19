import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { Duty } from '../../models/duty.model';
import { CreateEventRequest, Event, EventAssignmentRequest, EventDetails, EventDutyRequest, UpdateEventRequest } from '../../models/event.model';
import { UserResponse } from '../../models/user.model';
import { DutyService } from '../../services/duty.service';
import { EventService } from '../../services/event.service';
import { UserService } from '../../services/user.service';
import { EventReportComponent } from '../event-report/event-report.component';

@Component({
    selector: 'app-event-management',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, EventReportComponent],
    templateUrl: './event-management.component.html',
    styleUrl: './event-management.component.css'
})
export class EventManagementComponent implements OnInit {

    // Dependencies
    private readonly eventService = inject(EventService);
    private readonly userService = inject(UserService);
    private readonly dutyService = inject(DutyService);
    private readonly fb = inject(FormBuilder);

    // Signals
    public events = signal<Event[]>([]);
    public users = signal<UserResponse[]>([]);
    public duties = signal<Duty[]>([]);
    public loading = signal<boolean>(false);
    public currentView = signal<'list' | 'create' | 'edit'>('list');
    public editingEvent = signal<Event | null>(null);
    public eventDetails = signal<EventDetails | null>(null);

    // Modal states
    public showDutyModal = signal<boolean>(false);
    public showUserModal = signal<boolean>(false);
    public showDeleteModal = signal<boolean>(false);
    public deletingEvent = signal<Event | null>(null);
    public showEventReport = signal<boolean>(false);
    public selectedEventIdForReport = signal<number>(0);

    // Search and filter terms
    public searchTerm = signal<string>('');
    public startDateFilter = signal<string | null>(null);
    public endDateFilter = signal<string | null>(null);
    public currentPage = signal<number>(1);
    public pageSize = signal<number>(10);
    public dutySearchTerm = signal<string>('');
    public userSearchTerm = signal<string>('');

    // Form states
    public selectedDuties = signal<number[]>([]);
    public dutyScores = signal<{ [key: number]: number }>({});
    public selectedUsers = signal<string[]>([]);
    public assignments = signal<{ userId: string, dutyId: number }[]>([]);

    // Form
    public eventForm: FormGroup;

    // Computed properties
    public filteredEvents = computed(() => {
        let filtered = this.events();

        // Search filter
        const search = this.searchTerm().toLowerCase();
        if (search) {
            filtered = filtered.filter(event =>
                event.name.toLowerCase().includes(search) ||
                event.description.toLowerCase().includes(search)
            );
        }

        // Start date filter
        const startDate = this.startDateFilter();
        if (startDate) {
            filtered = filtered.filter(event =>
                new Date(event.startDate) >= new Date(startDate)
            );
        }

        // End date filter
        const endDate = this.endDateFilter();
        if (endDate) {
            filtered = filtered.filter(event =>
                new Date(event.endDate) <= new Date(endDate)
            );
        }

        return filtered;
    });

    public paginatedEvents = computed(() => {
        const filtered = this.filteredEvents();
        const page = this.currentPage();
        const size = this.pageSize();
        const startIndex = (page - 1) * size;
        return filtered.slice(startIndex, startIndex + size);
    });

    public totalPages = computed(() => {
        return Math.ceil(this.filteredEvents().length / this.pageSize());
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

    public filteredDuties = computed(() => {
        const search = this.dutySearchTerm().toLowerCase();
        return this.duties().filter(duty =>
            !this.selectedDuties().includes(duty.id) &&
            (duty.name.toLowerCase().includes(search) ||
                duty.description.toLowerCase().includes(search))
        );
    });

    public filteredUsers = computed(() => {
        const search = this.userSearchTerm().toLowerCase();
        return this.users().filter(user =>
            !this.selectedUsers().includes(user.id) &&
            (user.fullName.toLowerCase().includes(search) ||
                user.academicRank.toLowerCase().includes(search))
        );
    });

    public completionStatus = computed(() => {
        const unassignedUsers = this.selectedUsers().filter(userId =>
            !this.assignments().find(a => a.userId === userId)
        );

        // A duty is considered unassigned if it has no users assigned to it
        const unassignedDuties = this.selectedDuties().filter(dutyId =>
            !this.assignments().find(a => a.dutyId === dutyId)
        );

        return {
            unassignedUsers,
            unassignedDuties,
            unassignedUsersNames: unassignedUsers.map(userId => this.getUserName(userId)).join(', '),
            unassignedDutiesNames: unassignedDuties.map(dutyId => this.getDutyName(dutyId)).join(', '),
            isComplete: unassignedUsers.length === 0 && unassignedDuties.length === 0
        };
    });

    constructor() {
        this.eventForm = this.fb.group({
            name: ['', [Validators.required]],
            description: ['', [Validators.required]],
            startDate: ['', [Validators.required]],
            endDate: ['', [Validators.required]]
        });
    }

    ngOnInit(): void {
        this.loadInitialData();
    }

    // Data loading methods
    private loadInitialData(): void {
        this.loading.set(true);
        forkJoin({
            events: this.eventService.getAllEventsApi(),
            users: this.userService.getAllUsersApi(),
            duties: this.dutyService.getAllDutiesApi()
        }).pipe(
            catchError(error => {
                console.error('Error loading initial data:', error);
                return of({ events: { result: [] }, users: [], duties: { result: [] } });
            }),
            finalize(() => this.loading.set(false))
        ).subscribe(data => {
            if (data.events?.result) {
                this.events.set(data.events.result);
            }
            if (data.users) {
                this.users.set(data.users);
            }
            if (data.duties?.result) {
                this.duties.set(data.duties.result);
            }
        });
    }

    public loadEvents(): void {
        this.loading.set(true);
        this.eventService.getAllEventsApi()
            .pipe(
                catchError(error => {
                    console.error('Error loading events:', error);
                    return of({ result: [] });
                }),
                finalize(() => this.loading.set(false))
            )
            .subscribe(data => {
                if (data?.result) {
                    this.events.set(data.result);
                }
            });
    }

    public loadEventDetails(eventId: number): void {
        this.loading.set(true);
        this.eventService.getEventByIdApi(eventId)
            .pipe(
                catchError(error => {
                    console.error('Error loading event details:', error);
                    return of(null);
                }),
                finalize(() => this.loading.set(false))
            )
            .subscribe(response => {
                if (response?.result) {
                    this.eventDetails.set(response.result);
                    this.populateFormWithEventDetails(response.result);
                }
            });
    }

    // Search and filter methods
    public onSearch(term: string): void {
        this.searchTerm.set(term);
        this.currentPage.set(1);
    }

    public onStartDateFilter(date: string): void {
        this.startDateFilter.set(date);
        this.currentPage.set(1);
    }

    public onEndDateFilter(date: string): void {
        this.endDateFilter.set(date);
        this.currentPage.set(1);
    }

    // View navigation methods
    public handleCreateEvent(): void {
        this.resetForm();
        this.currentView.set('create');
        this.editingEvent.set(null);
    }

    public handleEditEvent(event: Event): void {
        this.editingEvent.set(event);
        this.currentView.set('edit');
        this.loadEventDetails(event.id);
    }

    public backToList(): void {
        this.currentView.set('list');
        this.resetForm();
    }

    // Form management methods
    private resetForm(): void {
        this.eventForm.reset();
        this.selectedDuties.set([]);
        this.dutyScores.set({});
        this.selectedUsers.set([]);
        this.assignments.set([]);
        this.eventDetails.set(null);
    }

    private populateFormWithEventDetails(details: EventDetails): void {
        this.eventForm.patchValue({
            name: details.name,
            description: details.description,
            startDate: details.startDate,
            endDate: details.endDate
        });

        const selectedDuties = details.duties.map(d => d.dutyId);
        const dutyScores: { [key: number]: number } = {};
        details.duties.forEach(d => {
            dutyScores[d.dutyId] = d.score;
        });

        const selectedUsers = details.participants.map(p => p.userId);
        const assignments = details.participants
            .filter(p => p.assignedDuty)
            .map(p => ({ userId: p.userId, dutyId: p.assignedDuty!.dutyId }));

        this.selectedDuties.set(selectedDuties);
        this.dutyScores.set(dutyScores);
        this.selectedUsers.set(selectedUsers);
        this.assignments.set(assignments);
    }

    // Event operations
    public saveEvent(): void {
        if (!this.eventForm.valid) {
            alert('Vui lòng hoàn thành tất cả thông tin bắt buộc!');
            return;
        }

        this.loading.set(true);
        const formValue = this.eventForm.value;

        const duties: EventDutyRequest[] = this.selectedDuties().map(dutyId => ({
            dutyId,
            score: this.dutyScores()[dutyId] || 0
        }));

        const assignments: EventAssignmentRequest[] = this.assignments().map(a => ({
            userId: a.userId,
            dutyId: a.dutyId
        }));

        const request: CreateEventRequest | UpdateEventRequest = {
            name: formValue.name,
            description: formValue.description,
            startDate: formValue.startDate,
            endDate: formValue.endDate,
            duties,
            assignments
        };

        const operation = this.currentView() === 'create'
            ? this.eventService.createEventApi(request as CreateEventRequest)
            : this.eventService.updateEventApi(this.editingEvent()!.id, request as UpdateEventRequest);

        operation.pipe(
            catchError(error => {
                console.error('Error saving event:', error);
                alert('Có lỗi xảy ra khi lưu sự kiện');
                return of(null);
            }),
            finalize(() => this.loading.set(false))
        ).subscribe(response => {
            if (response?.result) {
                if (this.currentView() === 'create') {
                    this.events.set([...this.events(), response.result]);
                } else {
                    const events = this.events();
                    const index = events.findIndex(e => e.id === response.result!.id);
                    if (index !== -1) {
                        events[index] = response.result!;
                        this.events.set([...events]);
                    }
                }
                alert('Lưu sự kiện thành công!');
                this.backToList();
            }
        });
    }

    public openDeleteModal(event: Event): void {
        this.deletingEvent.set(event);
        this.showDeleteModal.set(true);
    }

    public closeDeleteModal(): void {
        this.showDeleteModal.set(false);
        this.deletingEvent.set(null);
    }

    public deleteEvent(): void {
        if (!this.deletingEvent()) return;

        this.loading.set(true);
        this.eventService.deleteEventApi(this.deletingEvent()!.id)
            .pipe(
                catchError(error => {
                    console.error('Error deleting event:', error);
                    alert('Có lỗi xảy ra khi xóa sự kiện');
                    return of(false);
                }),
                finalize(() => this.loading.set(false))
            )
            .subscribe(success => {
                if (success) {
                    const events = this.events().filter(e => e.id !== this.deletingEvent()!.id);
                    this.events.set(events);
                    this.closeDeleteModal();
                    alert('Xóa sự kiện thành công!');
                }
            });
    }

    // Duty management methods
    public addDutyToEvent(dutyId: number): void {
        if (!this.selectedDuties().includes(dutyId)) {
            this.selectedDuties.set([...this.selectedDuties(), dutyId]);
            this.dutyScores.set({ ...this.dutyScores(), [dutyId]: 0 });
        }
        this.showDutyModal.set(false);
        this.dutySearchTerm.set('');
    }

    public removeDutyFromEvent(dutyId: number): void {
        this.selectedDuties.set(this.selectedDuties().filter(id => id !== dutyId));
        const newScores = { ...this.dutyScores() };
        delete newScores[dutyId];
        this.dutyScores.set(newScores);
        // Remove all assignments for this duty (since multiple users can be assigned to one duty)
        this.assignments.set(this.assignments().filter(a => a.dutyId !== dutyId));
    }

    public updateDutyScore(dutyId: number, score: number): void {
        this.dutyScores.set({ ...this.dutyScores(), [dutyId]: score });
    }

    // User management methods
    public addUserToEvent(userId: string): void {
        if (!this.selectedUsers().includes(userId)) {
            this.selectedUsers.set([...this.selectedUsers(), userId]);
        }
        this.showUserModal.set(false);
        this.userSearchTerm.set('');
    }

    public removeUserFromEvent(userId: string): void {
        this.selectedUsers.set(this.selectedUsers().filter(id => id !== userId));
        this.assignments.set(this.assignments().filter(a => a.userId !== userId));
    }

    // Assignment methods
    public assignUserToDuty(userId: string, dutyId: number | null): void {
        const newAssignments = this.assignments().filter(a => a.userId !== userId);

        if (dutyId) {
            // Check if user is already assigned to another duty
            const userCurrentAssignment = this.assignments().find(a => a.userId === userId);
            if (userCurrentAssignment && userCurrentAssignment.dutyId !== dutyId) {
                const currentDutyName = this.getDutyName(userCurrentAssignment.dutyId);
                const newDutyName = this.getDutyName(dutyId);
                const confirmChange = confirm(`Người dùng hiện đang được gán nhiệm vụ "${currentDutyName}". Bạn có muốn chuyển sang nhiệm vụ "${newDutyName}" không?`);
                if (!confirmChange) {
                    return;
                }
            }

            newAssignments.push({ userId, dutyId });
        }

        this.assignments.set(newAssignments);
    }

    // Helper methods
    public getUserDuty(userId: string): number | null {
        const assignment = this.assignments().find(a => a.userId === userId);
        return assignment ? assignment.dutyId : null;
    }

    public getDutyAssignedUsers(dutyId: number): string[] {
        return this.assignments()
            .filter(a => a.dutyId === dutyId)
            .map(a => a.userId);
    }

    public getDutyAssignedUsersNames(dutyId: number): string {
        const userIds = this.getDutyAssignedUsers(dutyId);
        if (userIds.length === 0) return '';
        return userIds.map(userId => this.getUserName(userId)).join(', ');
    }

    public getUserName(userId: string): string {
        const user = this.users().find(u => u.id === userId);
        return user ? user.fullName : '';
    }

    public getDutyName(dutyId: number): string {
        const duty = this.duties().find(d => d.id === dutyId);
        return duty ? duty.name : '';
    }

    public getDutyById(dutyId: number): Duty | undefined {
        return this.duties().find(d => d.id === dutyId);
    }

    public getUserById(userId: string): UserResponse | undefined {
        return this.users().find(u => u.id === userId);
    }

    public getAcademicRankDisplay(rank: string): string {
        const ranks: { [key: string]: string } = {
            'TG': 'Trợ giảng',
            'GVC': 'Giảng viên chính',
            'PGS': 'Phó giáo sư',
            'GS': 'Giáo sư',
            // Keep old values for backward compatibility
            'assistant': 'Trợ giảng',
            'lecturer': 'Giảng viên',
            'teacher': 'Giáo viên',
            'associate_professor': 'Phó giáo sư',
            'professor': 'Giáo sư'
        };
        return ranks[rank] || rank;
    }

    public getAcademicDegreeDisplay(degree: string): string {
        const degrees: { [key: string]: string } = {
            'KS': 'Kỹ sư',
            'ThS': 'Thạc sĩ',
            'TS': 'Tiến sĩ',
            // Keep old values for backward compatibility
            'bachelor': 'Cử nhân',
            'master': 'Thạc sĩ',
            'doctor': 'Tiến sĩ',
            'phd': 'Tiến sĩ'
        };
        return degrees[degree] || degree;
    }

    public formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    }

    // Pagination methods
    public goToPage(page: number): void {
        if (page >= 1 && page <= this.totalPages()) {
            this.currentPage.set(page);
        }
    }

    // Search and filter methods
    public clearFilters(): void {
        this.searchTerm.set('');
        this.startDateFilter.set(null);
        this.endDateFilter.set(null);
        this.currentPage.set(1);
    }

    public onSearchInput(inputEvent: any): void {
        const target = inputEvent.target as HTMLInputElement;
        this.searchTerm.set(target.value);
        this.currentPage.set(1);
    }

    public onStartDateChange(changeEvent: any): void {
        const target = changeEvent.target as HTMLInputElement;
        this.startDateFilter.set(target.value || null);
        this.currentPage.set(1);
    }

    public onEndDateChange(changeEvent: any): void {
        const target = changeEvent.target as HTMLInputElement;
        this.endDateFilter.set(target.value || null);
        this.currentPage.set(1);
    }

    // Event Report Methods
    public openEventReport(eventId: number): void {
        this.selectedEventIdForReport.set(eventId);
        this.showEventReport.set(true);
    }

    public closeEventReport(): void {
        this.showEventReport.set(false);
        this.selectedEventIdForReport.set(0);
    }

    // Make Math available in template
    public get Math() {
        return Math;
    }
}
