import { Component } from '@angular/core';
import { Users } from '../../services/users';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  showPassword = false;

  constructor(
    private usersService: Users,
    private router : Router
  ) {
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  LoginButton() {
       this.usersService.Login(this.usersService).subscribe(
        (response) => {
          alert('Login successful!');
          // console.log('Login successful:', response);
          this.router.navigate(['']);
        },
        (error) => {
          console.error('Login failed:', error);
        }
      );}
}
