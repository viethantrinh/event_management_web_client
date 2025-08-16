import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { EventListComponent } from './pages/event-list/event-list.component';
import { EventManagementComponent } from './pages/event-management/event-management.component';
import { ExportComponent } from './pages/export/export.component';
import { OverviewComponent } from './pages/overview/overview.component';
import { UserManagementComponent } from './pages/user-management/user-management.component';

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  roles: string[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    OverviewComponent,
    UserManagementComponent,
    EventManagementComponent,
    EventListComponent,
    ExportComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  private readonly authService = inject(AuthService);

  // Signals
  public currentUser = this.authService.currentUser;
  public sidebarCollapsed = signal<boolean>(false);
  public activeMenuItem = signal<string>('');

  // Menu items configuration
  public menuItems: MenuItem[] = [
    {
      id: 'overview',
      label: 'Tổng quan',
      icon: 'fas fa-chart-line',
      roles: ['ADMIN']
    },
    {
      id: 'user-management',
      label: 'Quản lý người dùng',
      icon: 'fas fa-users',
      roles: ['ADMIN']
    },
    {
      id: 'event-management',
      label: 'Quản lý sự kiện',
      icon: 'fas fa-calendar-alt',
      roles: ['ADMIN']
    },
    {
      id: 'event-list',
      label: 'Danh sách sự kiện',
      icon: 'fas fa-list',
      roles: ['USER']
    },
    {
      id: 'export',
      label: 'Xuất file Excel',
      icon: 'fas fa-file-excel',
      roles: ['USER', 'ADMIN']
    }
  ];

  // Computed property to filter menu items based on user role
  public visibleMenuItems = computed(() => {
    const user = this.currentUser();
    if (!user || !user.roles) return [];

    const userRoles = user.roles.map(role => role.name);
    return this.menuItems.filter(item =>
      item.roles.some(role => userRoles.includes(role))
    );
  });

  // Check if user has admin role
  public isAdmin = computed(() => {
    const user = this.currentUser();
    return user?.roles?.some(role => role.name === 'ADMIN') || false;
  });

  constructor() {
    // Effect to set default active menu item when user data is available
    effect(() => {
      const user = this.currentUser();
      if (user && user.roles && this.activeMenuItem() === '') {
        if (this.isAdmin()) {
          this.activeMenuItem.set('overview');
        } else {
          this.activeMenuItem.set('event-list');
        }
      }
    });
  }

  // Methods
  public selectMenuItem(itemId: string): void {
    this.activeMenuItem.set(itemId);
  }

  public toggleSidebar(): void {
    this.sidebarCollapsed.update(collapsed => !collapsed);
  }

  public logout(): void {
    // Implement logout logic here
    console.log('Logout clicked');
  }
}
