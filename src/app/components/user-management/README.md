# User Management Component

## Tổng quan
Component quản lý người dùng cung cấp giao diện đầy đủ để ADMIN quản lý người dùng trong hệ thống với các tính năng tìm kiếm, lọc, phân trang, chỉnh sửa và xóa.

## Tính năng chính

### 1. Hiển thị danh sách người dùng
- Bảng hiển thị thông tin: Tên, Email, Số điện thoại, Học hàm, Học vị, Vai trò
- Hiển thị avatar người dùng
- Badge để phân biệt vai trò (ADMIN/USER)
- Phân trang với điều hướng

### 2. Tìm kiếm và lọc
- **Tìm kiếm**: Theo tên, email hoặc số điện thoại
- **Lọc theo vai trò**: USER, ADMIN
- **Lọc theo học hàm**: Trợ giảng, Giảng viên, Giáo viên, Phó giáo sư, Giáo sư
- **Lọc theo học vị**: Cử nhân, Thạc sĩ, Tiến sĩ
- Nút xóa tất cả bộ lọc

### 3. Chỉnh sửa người dùng
- Modal popup với form đầy đủ
- Validation cho tất cả trường bắt buộc
- Dropdown cho học hàm, học vị
- Checkbox cho multiple roles
- Hiển thị loading state
- Xác nhận trước khi cập nhật

### 4. Xóa người dùng
- Modal xác nhận với thông tin người dùng
- Cảnh báo về tính không thể hoàn tác
- Loading state trong quá trình xóa

## API Integration

### 1. GET /api/users
Lấy danh sách tất cả người dùng
```typescript
getAllUsersApi(): Observable<UserResponse[]>
```

### 2. GET /api/users/{id}
Lấy thông tin chi tiết một người dùng
```typescript
getUserByIdApi(id: string): Observable<UserResponse | undefined>
```

### 3. PUT /api/users/{id}
Cập nhật thông tin người dùng
```typescript
updateUserApi(id: string, request: UpdateUserRequest): Observable<UserResponse | undefined>
```

### 4. DELETE /api/users/{id}
Xóa người dùng
```typescript
deleteUserApi(id: string): Observable<boolean>
```

## Models

### UserResponse
```typescript
interface UserResponse {
  id: string;
  email: string;
  workEmail?: string;
  fullName: string;
  phoneNumber: string;
  academicRank: string;
  academicDegree: string;
  roles: RoleResponse[];
}
```

### UpdateUserRequest
```typescript
interface UpdateUserRequest {
  email: string;
  workEmail?: string;
  fullName: string;
  phoneNumber: string;
  academicRank: string;
  academicDegree: string;
  roleNames: string[];
}
```

## Signals được sử dụng

- `users`: Danh sách người dùng từ API
- `loading`: Trạng thái loading
- `currentPage`: Trang hiện tại
- `pageSize`: Số item per page
- `searchTerm`: Từ khóa tìm kiếm
- `selectedRole`: Vai trò được chọn để lọc
- `selectedAcademicRank`: Học hàm được chọn để lọc
- `selectedAcademicDegree`: Học vị được chọn để lọc
- `showEditModal`: Hiển thị modal chỉnh sửa
- `showDeleteModal`: Hiển thị modal xóa
- `editingUser`: User đang được chỉnh sửa
- `deletingUser`: User đang được xóa

## Computed Properties

- `filteredUsers`: Danh sách sau khi áp dụng filter
- `paginatedUsers`: Danh sách cho trang hiện tại
- `totalPages`: Tổng số trang
- `pageNumbers`: Array số trang để hiển thị pagination

## Modern Angular Features

### 1. Control Flow
- `@if` thay cho `*ngIf`
- `@for` thay cho `*ngFor`
- `@else` blocks

### 2. Signals
- `signal()` cho reactive state
- `computed()` cho derived state
- `effect()` cho side effects

### 3. Reactive Forms
- FormBuilder với validation
- Dynamic form controls
- Custom validators

### 4. Standalone Component
- Không cần NgModule
- Explicit imports

## Responsive Design

- Bootstrap grid system
- Mobile-friendly modals
- Responsive table với horizontal scroll
- Adaptive button sizes
- Mobile-optimized pagination

## Error Handling

- Catch và display errors từ API calls
- Form validation với error messages
- Loading states để prevent multiple submissions
- User-friendly error notifications

## Security

- Role-based access (chỉ ADMIN)
- Input validation và sanitization
- Confirmation dialogs cho destructive actions
- CSRF protection thông qua HTTP interceptors

## Accessibility

- Proper ARIA labels
- Keyboard navigation support
- Screen reader friendly
- Focus management trong modals
- Color contrast compliance

## Performance

- OnPush change detection strategy
- Lazy loading cho large datasets
- Debounced search
- Efficient filtering với computed signals
- Memory leak prevention

## Usage Example

```typescript
// Trong dashboard component
@Component({
  template: `
    @switch (activeMenuItem()) {
      @case ('user-management') {
        <app-user-management></app-user-management>
      }
    }
  `
})
```

## Dependencies

- Angular 20+ với Signals
- Bootstrap 5.3.7
- Font Awesome 6.4.0
- Reactive Forms
- HttpClient

## Future Enhancements

1. **Bulk operations**: Select multiple users for bulk delete/update
2. **Export functionality**: Export user list to Excel/CSV
3. **Advanced filters**: Date range, last login, etc.
4. **User creation**: Add new user functionality
5. **Audit trail**: Track changes made to users
6. **Profile pictures**: Upload and display user avatars
7. **Password reset**: Admin can reset user passwords
