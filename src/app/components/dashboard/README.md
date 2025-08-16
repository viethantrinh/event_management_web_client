# Dashboard Component Structure

## Tổng quan
Dashboard component được thiết kế với kiến trúc responsive và sử dụng các tính năng mới nhất của Angular như `@if`, `@for`, `@switch` thay cho các directive cũ.

## Cấu trúc thư mục
```
src/app/components/dashboard/
├── dashboard.component.ts       # Component chính
├── dashboard.component.html     # Template chính với sidebar
├── dashboard.component.css      # Styles responsive
└── pages/                       # Các trang con
    ├── overview/               # Trang tổng quan (ADMIN only)
    ├── user-management/        # Quản lý người dùng (ADMIN only)
    ├── event-management/       # Quản lý sự kiện (ADMIN only)
    ├── event-list/            # Danh sách sự kiện (USER & ADMIN)
    └── export/                # Xuất Excel (USER & ADMIN)
```

## Tính năng chính

### 1. Role-based Navigation
- **ADMIN**: Có quyền truy cập tất cả các mục menu
  - Tổng quan
  - Quản lý người dùng  
  - Quản lý sự kiện
  - Danh sách sự kiện
  - Xuất file Excel

- **USER**: Chỉ có quyền truy cập một số mục
  - Danh sách sự kiện
  - Xuất file Excel

### 2. Responsive Design
- **Desktop (>= 1200px)**: Sidebar luôn hiển thị, có thể thu gọn
- **Tablet (768px - 1199px)**: Sidebar overlay, ẩn/hiện bằng toggle
- **Mobile (< 768px)**: Sidebar overlay với mobile overlay

### 3. Angular Signals
- Sử dụng `signal()` và `computed()` để quản lý state
- `effect()` để tự động cập nhật menu mặc định theo role

### 4. Modern Angular Syntax
- `@if` thay cho `*ngIf`
- `@for` thay cho `*ngFor`  
- `@switch` thay cho `*ngSwitch`
- Standalone components

## Cách sử dụng

### Thêm menu item mới
```typescript
// Trong dashboard.component.ts
public menuItems: MenuItem[] = [
  // ... existing items
  {
    id: 'new-feature',
    label: 'Tính năng mới',
    icon: 'fas fa-star',
    roles: ['ADMIN'] // hoặc ['USER', 'ADMIN']
  }
];
```

### Tạo component mới
1. Tạo thư mục trong `pages/`
2. Tạo component với Angular CLI hoặc manual
3. Import component vào dashboard.component.ts
4. Thêm case trong template `@switch`

### Customization
- Thay đổi màu sắc trong CSS variables
- Cập nhật logo trong sidebar header
- Thêm animation transitions
- Customize breakpoints responsive

## Dependencies
- Bootstrap 5.3.7 (đã cài sẵn)
- Font Awesome 6.4.0 (CDN)
- Angular 20+ với standalone components

## Notes
- Component sử dụng AuthService để lấy thông tin user
- Role checking dựa trên `user.roles` array
- Sidebar state được lưu trong signal, có thể persist vào localStorage nếu cần
- Mobile overlay tự động ẩn khi click outside sidebar
