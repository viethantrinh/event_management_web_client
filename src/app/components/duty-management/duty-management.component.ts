import { CommonModule } from '@angular/common';
import { Component, computed, effect, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateDutyRequest, Duty, UpdateDutyRequest } from '../../models/duty.model';
import { DutyService } from '../../services/duty.service';

@Component({
  selector: 'app-duty-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './duty-management.component.html',
  styleUrl: './duty-management.component.css'
})
export class DutyManagementComponent {
  // Signals for state management
  duties = signal<Duty[]>([]);
  filteredDuties = computed(() => {
    const duties = this.duties();
    const searchTerm = this.searchTerm().toLowerCase().trim();

    if (!searchTerm) {
      return duties;
    }

    return duties.filter(duty =>
      duty.name.toLowerCase().includes(searchTerm) ||
      duty.description.toLowerCase().includes(searchTerm)
    );
  });

  loading = signal(false);
  searchTerm = signal('');

  // Pagination
  currentPage = signal(1);
  itemsPerPage = signal(10);
  totalPages = computed(() => Math.ceil(this.filteredDuties().length / this.itemsPerPage()));
  paginatedDuties = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return this.filteredDuties().slice(start, end);
  });
  pageNumbers = computed(() => {
    const pages = [];
    const totalPages = this.totalPages();
    const currentPage = this.currentPage();

    // Show max 5 pages around current page
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  });

  // Modal states
  showCreateModal = signal(false);
  showEditModal = signal(false);
  showDeleteModal = signal(false);
  editingDuty = signal<Duty | null>(null);
  deletingDuty = signal<Duty | null>(null);

  // Forms
  createForm: FormGroup;
  editForm: FormGroup;

  constructor(
    private dutyService: DutyService,
    private fb: FormBuilder
  ) {
    this.createForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(2)]]
    });

    this.editForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(2)]]
    });

    // Load duties on component initialization
    effect(() => {
      this.loadDuties();
    }, { allowSignalWrites: true });
  }

  /**
   * Load all duties from API
   */
  loadDuties(): void {
    this.loading.set(true);
    this.dutyService.getAllDutiesApi().subscribe({
      next: (response) => {
        if (response.code === 1000 && response.result) {
          this.duties.set(response.result);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading duties:', error);
        this.loading.set(false);
      }
    });
  }

  /**
   * Handle search input
   */
  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.currentPage.set(1); // Reset to first page when searching
  }

  /**
   * Clear search
   */
  clearSearch(): void {
    this.searchTerm.set('');
    this.currentPage.set(1);
  }

  /**
   * Pagination methods
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  /**
   * Create Modal Methods
   */
  openCreateModal(): void {
    this.createForm.reset();
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
    this.createForm.reset();
  }

  onCreateDuty(): void {
    if (this.createForm.valid && !this.loading()) {
      this.loading.set(true);
      const dutyData: CreateDutyRequest = this.createForm.value;

      this.dutyService.createDutyApi(dutyData).subscribe({
        next: (response) => {
          if (response.code === 1000) {
            this.loadDuties(); // Reload duties list
            this.closeCreateModal();
            console.log('Duty created successfully');
          }
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error creating duty:', error);
          this.loading.set(false);
        }
      });
    }
  }

  /**
   * Edit Modal Methods
   */
  openEditModal(duty: Duty): void {
    this.loading.set(true);
    // Get fresh duty data from API
    this.dutyService.getDutyByIdApi(duty.id).subscribe({
      next: (response) => {
        if (response.code === 1000 && response.result) {
          this.editingDuty.set(response.result);
          this.editForm.patchValue({
            name: response.result.name,
            description: response.result.description
          });
          this.showEditModal.set(true);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading duty details:', error);
        this.loading.set(false);
      }
    });
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.editingDuty.set(null);
    this.editForm.reset();
  }

  onUpdateDuty(): void {
    if (this.editForm.valid && !this.loading() && this.editingDuty()) {
      this.loading.set(true);
      const dutyData: UpdateDutyRequest = this.editForm.value;
      const dutyId = this.editingDuty()!.id;

      this.dutyService.updateDutyApi(dutyId, dutyData).subscribe({
        next: (response) => {
          if (response.code === 1000) {
            this.loadDuties(); // Reload duties list
            this.closeEditModal();
            console.log('Duty updated successfully');
          }
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error updating duty:', error);
          this.loading.set(false);
        }
      });
    }
  }

  /**
   * Delete Modal Methods
   */
  openDeleteModal(duty: Duty): void {
    this.deletingDuty.set(duty);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.deletingDuty.set(null);
  }

  onDeleteDuty(): void {
    if (!this.loading() && this.deletingDuty()) {
      this.loading.set(true);
      const dutyId = this.deletingDuty()!.id;

      this.dutyService.deleteDutyApi(dutyId).subscribe({
        next: (response) => {
          if (response.code === 1000) {
            this.loadDuties(); // Reload duties list
            this.closeDeleteModal();
            console.log('Duty deleted successfully');
          }
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error deleting duty:', error);
          this.loading.set(false);
        }
      });
    }
  }
}
