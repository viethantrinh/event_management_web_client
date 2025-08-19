import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, finalize, of } from 'rxjs';
import { UpdateUserRequest, UserResponse } from '../../models/user.model';
import { UserService } from '../../services/user.service';

@Component({
    selector: 'app-user-management',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './user-management.component.html',
    styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit {

    // Dependencies
    private readonly userService = inject(UserService);
    private readonly fb = inject(FormBuilder);

    // Signals
    public users = signal<UserResponse[]>([]);
    public loading = signal<boolean>(false);
    public currentPage = signal<number>(1);
    public pageSize = signal<number>(10);
    public searchTerm = signal<string>('');
    public selectedRole = signal<string>('');
    public selectedAcademicRank = signal<string>('');
    public selectedAcademicDegree = signal<string>('');
    public showEditModal = signal<boolean>(false);
    public showDeleteModal = signal<boolean>(false);
    public editingUser = signal<UserResponse | null>(null);
    public deletingUser = signal<UserResponse | null>(null);

    // Form
    public editForm: FormGroup;

    // Constants
    public readonly roles = ['USER', 'ADMIN'];
    public readonly academicRanks = [
        'TG', 'GVC', 'PGS', 'GS'
    ];
    public readonly academicDegrees = [
        'KS', 'ThS', 'TS'
    ];

    // Computed properties
    public filteredUsers = computed(() => {
        let filtered = this.users();

        // Search filter
        const search = this.searchTerm().toLowerCase();
        if (search) {
            filtered = filtered.filter(user =>
                user.fullName.toLowerCase().includes(search) ||
                user.email.toLowerCase().includes(search) ||
                user.phoneNumber.includes(search)
            );
        }

        // Role filter
        const role = this.selectedRole();
        if (role) {
            filtered = filtered.filter(user =>
                user.roles.some(r => r.name === role)
            );
        }

        // Academic rank filter
        const academicRank = this.selectedAcademicRank();
        if (academicRank) {
            filtered = filtered.filter(user => user.academicRank === academicRank);
        }

        // Academic degree filter
        const academicDegree = this.selectedAcademicDegree();
        if (academicDegree) {
            filtered = filtered.filter(user => user.academicDegree === academicDegree);
        }

        return filtered;
    });

    public paginatedUsers = computed(() => {
        const filtered = this.filteredUsers();
        const page = this.currentPage();
        const size = this.pageSize();
        const startIndex = (page - 1) * size;
        return filtered.slice(startIndex, startIndex + size);
    });

    public totalPages = computed(() => {
        return Math.ceil(this.filteredUsers().length / this.pageSize());
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

    constructor() {
        this.editForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            workEmail: ['', [Validators.email]],
            fullName: ['', [Validators.required]],
            phoneNumber: ['', [Validators.required]],
            academicRank: ['', [Validators.required]],
            academicDegree: ['', [Validators.required]],
            roleNames: [[], [Validators.required]]
        });
    }

    ngOnInit(): void {
        this.loadUsers();
    }

    // Methods
    public loadUsers(): void {
        this.loading.set(true);
        this.userService.getAllUsersApi()
            .pipe(
                catchError(error => {
                    console.error('Error loading users:', error);
                    return of([]);
                }),
                finalize(() => this.loading.set(false))
            )
            .subscribe(users => {
                this.users.set(users);
            });
    }

    public onSearch(term: string): void {
        this.searchTerm.set(term);
        this.currentPage.set(1);
    }

    public onRoleFilter(role: string): void {
        this.selectedRole.set(role);
        this.currentPage.set(1);
    }

    public onAcademicRankFilter(rank: string): void {
        this.selectedAcademicRank.set(rank);
        this.currentPage.set(1);
    }

    public onAcademicDegreeFilter(degree: string): void {
        this.selectedAcademicDegree.set(degree);
        this.currentPage.set(1);
    }

    public goToPage(page: number): void {
        if (page >= 1 && page <= this.totalPages()) {
            this.currentPage.set(page);
        }
    }

    public openEditModal(user: UserResponse): void {
        this.editingUser.set(user);
        this.editForm.patchValue({
            email: user.email,
            workEmail: user.workEmail,
            fullName: user.fullName,
            phoneNumber: user.phoneNumber,
            academicRank: user.academicRank,
            academicDegree: user.academicDegree,
            roleNames: user.roles.map(r => r.name)
        });
        this.showEditModal.set(true);
    }

    public closeEditModal(): void {
        this.showEditModal.set(false);
        this.editingUser.set(null);
        this.editForm.reset();
    }

    public onUpdateUser(): void {
        if (this.editForm.valid && this.editingUser()) {
            this.loading.set(true);
            const userId = this.editingUser()!.id;
            const request: UpdateUserRequest = this.editForm.value;

            this.userService.updateUserApi(userId, request)
                .pipe(
                    catchError(error => {
                        console.error('Error updating user:', error);
                        alert('Có lỗi xảy ra khi cập nhật người dùng');
                        return of(null);
                    }),
                    finalize(() => this.loading.set(false))
                )
                .subscribe(updatedUser => {
                    if (updatedUser) {
                        // Update user in list
                        const users = this.users();
                        const index = users.findIndex(u => u.id === userId);
                        if (index !== -1) {
                            users[index] = updatedUser;
                            this.users.set([...users]);
                        }
                        this.closeEditModal();
                        alert('Cập nhật người dùng thành công');
                    }
                });
        }
    }

    public openDeleteModal(user: UserResponse): void {
        this.deletingUser.set(user);
        this.showDeleteModal.set(true);
    }

    public closeDeleteModal(): void {
        this.showDeleteModal.set(false);
        this.deletingUser.set(null);
    }

    public onDeleteUser(): void {
        if (this.deletingUser()) {
            this.loading.set(true);
            const userId = this.deletingUser()!.id;

            this.userService.deleteUserApi(userId)
                .pipe(
                    catchError(error => {
                        console.error('Error deleting user:', error);
                        alert('Có lỗi xảy ra khi xóa người dùng');
                        return of(false);
                    }),
                    finalize(() => this.loading.set(false))
                )
                .subscribe(success => {
                    if (success) {
                        // Remove user from list
                        const users = this.users().filter(u => u.id !== userId);
                        this.users.set(users);
                        this.closeDeleteModal();
                        alert('Xóa người dùng thành công');
                    }
                });
        }
    }

    public clearFilters(): void {
        this.searchTerm.set('');
        this.selectedRole.set('');
        this.selectedAcademicRank.set('');
        this.selectedAcademicDegree.set('');
        this.currentPage.set(1);
    }

    public getUserRoleDisplay(user: UserResponse): string {
        return user.roles.map(r => r.name).join(', ');
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

    public onRoleChange(role: string, event: Event): void {
        const checkbox = event.target as HTMLInputElement;
        const currentRoles = this.editForm.get('roleNames')?.value || [];

        if (checkbox.checked) {
            if (!currentRoles.includes(role)) {
                this.editForm.patchValue({
                    roleNames: [...currentRoles, role]
                });
            }
        } else {
            this.editForm.patchValue({
                roleNames: currentRoles.filter((r: string) => r !== role)
            });
        }
    }
}
