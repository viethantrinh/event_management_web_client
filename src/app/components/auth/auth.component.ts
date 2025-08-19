import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SignInRequest, SignUpRequest } from '../../models/auth.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent implements OnInit {

  // properties
  isSignIn = true;
  signInForm: FormGroup;
  signUpForm: FormGroup;

  // Constants
  public readonly academicRanks = [
    { value: 'TG', label: 'Trợ giảng' },
    { value: 'GVC', label: 'Giảng viên chính' },
    { value: 'PGS', label: 'Phó giáo sư' },
    { value: 'GS', label: 'Giáo sư' }
  ];

  public readonly academicDegrees = [
    { value: 'KS', label: 'Kỹ sư' },
    { value: 'ThS', label: 'Thạc sĩ' },
    { value: 'TS', label: 'Tiến sĩ' }
  ];

  // dependencies
  private readonly fb = inject(FormBuilder)
  private readonly authService = inject(AuthService)
  private readonly router = inject(Router)

  constructor() {
    this.signInForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.minLength(3),
        Validators.maxLength(64)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(256)
      ]]
    });
    this.signUpForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.minLength(3),
        Validators.maxLength(64)
      ]],
      workEmail: ['', [Validators.email]], // Optional field, only email format validation
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(256)
      ]],
      fullName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(128)
      ]],
      phoneNumber: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(16)
      ]],
      academicRank: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(64)
      ]],
      academicDegree: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(64)
      ]]
    });
  }

  ngOnInit() {
    this.checkAuthentication();
  }

  // Helper methods to get specific error messages
  getSignInEmailError(): string {
    const control = this.signInForm.get('email');
    if (control?.hasError('required')) return 'Email không được để trống';
    if (control?.hasError('minlength')) return 'Email phải có ít nhất 3 ký tự';
    if (control?.hasError('maxlength')) return 'Email phải từ 3 đến 64 ký tự';
    if (control?.hasError('email')) return 'Email phải có định dạng hợp lệ';
    return '';
  }

  getSignInPasswordError(): string {
    const control = this.signInForm.get('password');
    if (control?.hasError('required')) return 'Mật khẩu không được để trống';
    if (control?.hasError('minlength')) return 'Mật khẩu phải có ít nhất 8 ký tự';
    if (control?.hasError('maxlength')) return 'Mật khẩu phải từ 8 đến 256 ký tự';
    return '';
  }

  getSignUpEmailError(): string {
    const control = this.signUpForm.get('email');
    if (control?.hasError('required')) return 'Email không được để trống';
    if (control?.hasError('minlength')) return 'Email phải có ít nhất 3 ký tự';
    if (control?.hasError('maxlength')) return 'Email phải từ 3 đến 64 ký tự';
    if (control?.hasError('email')) return 'Email phải có định dạng hợp lệ';
    return '';
  }

  getWorkEmailError(): string {
    const control = this.signUpForm.get('workEmail');
    if (control?.hasError('email')) return 'Email công việc phải có định dạng hợp lệ';
    return '';
  }

  getSignUpPasswordError(): string {
    const control = this.signUpForm.get('password');
    if (control?.hasError('required')) return 'Mật khẩu không được để trống';
    if (control?.hasError('minlength')) return 'Mật khẩu phải có ít nhất 8 ký tự';
    if (control?.hasError('maxlength')) return 'Mật khẩu phải từ 8 đến 256 ký tự';
    return '';
  }

  getFullNameError(): string {
    const control = this.signUpForm.get('fullName');
    if (control?.hasError('required')) return 'Họ và tên không được để trống';
    if (control?.hasError('minlength')) return 'Họ và tên phải có ít nhất 2 ký tự';
    if (control?.hasError('maxlength')) return 'Họ và tên phải từ 2 đến 128 ký tự';
    return '';
  }

  getPhoneNumberError(): string {
    const control = this.signUpForm.get('phoneNumber');
    if (control?.hasError('required')) return 'Số điện thoại không được để trống';
    if (control?.hasError('minlength')) return 'Số điện thoại phải có ít nhất 8 ký tự';
    if (control?.hasError('maxlength')) return 'Số điện thoại phải từ 8 đến 16 ký tự';
    return '';
  }

  getAcademicRankError(): string {
    const control = this.signUpForm.get('academicRank');
    if (control?.hasError('required')) return 'Chức danh học thuật không được để trống';
    if (control?.hasError('minlength')) return 'Chức danh học thuật phải có ít nhất 2 ký tự';
    if (control?.hasError('maxlength')) return 'Chức danh học thuật phải từ 2 đến 64 ký tự';
    return '';
  }

  getAcademicDegreeError(): string {
    const control = this.signUpForm.get('academicDegree');
    if (control?.hasError('required')) return 'Học vị không được để trống';
    if (control?.hasError('minlength')) return 'Học vị phải có ít nhất 2 ký tự';
    if (control?.hasError('maxlength')) return 'Học vị phải từ 2 đến 64 ký tự';
    return '';
  }

  toggleAuthMode() {
    this.isSignIn = !this.isSignIn;
  }

  onSignIn() {
    if (this.signInForm.valid) {
      console.log('Sign In:', this.signInForm.value);
      // Implement sign in logic here
      const signInRequest: SignInRequest = {
        email: this.signInForm.value.email,
        password: this.signInForm.value.password
      }
      this.authService.signInApi(signInRequest).subscribe({
        next: () => {
          this.router.navigate(['/dashboard'])
        },
        error: (err) => console.log(err)
      })
    }
  }

  onSignUp() {
    if (this.signUpForm.valid) {
      console.log('Sign Up:', this.signUpForm.value);
      // Implement sign up logic here
      const signUpRequest: SignUpRequest = {
        email: this.signUpForm.value.email,
        workEmail: this.signUpForm.value.workEmail,
        password: this.signUpForm.value.password,
        fullName: this.signUpForm.value.fullName,
        phoneNumber: this.signUpForm.value.phoneNumber,
        academicRank: this.signUpForm.value.academicRank,
        academicDegree: this.signUpForm.value.academicDegree
      }

      this.authService.signUpApi(signUpRequest).subscribe({
        next: () => {
          this.router.navigate(['/dashboard'])
        },
        error: (err) => console.log(err)
      })
    }
  }

  private checkAuthentication() {
    if (this.authService.isAuthenticated()) {
      this.authService.introspectTokenApi().subscribe(valid => {
        if (valid) {
          this.router.navigate(['/dashboard'])
        }
      })
    }
  }
}

