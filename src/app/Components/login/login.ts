import { Component } from '@angular/core';
import { Users } from '../../services/users';
import { Router } from '@angular/router';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { find, map } from 'rxjs';
import { email } from '@angular/forms/signals';
import { validate , Validator} from '@angular/forms/signals';


@Component({
  selector: 'app-login',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  LoginObj:LoginModel = new LoginModel();
  showPassword = false;
  
  constructor(
    private usersService: Users,
    private router : Router
  ) {
  }
  
    loninform = new FormGroup ({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.maxLength(6)]),

    })





  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  LoginButton() {
      // (GET)  make sure that user exists.
      const fakeToken = crypto.randomUUID() + crypto.randomUUID();
      this.usersService.get_user().pipe(
        map(users => users.find((user:any) => 
          user.email === this.LoginObj.email && 
          user.password === this.LoginObj.password
        ))
      ).subscribe(user => {
        if (user) {
          // debugger;
          // alert('Done')
          localStorage.setItem('token', fakeToken); 
          console.log('Login successful', user);
        } else {
          alert('Invalid email or password')
          console.log('Invalid email or password');
        }
      });

      // this.usersService.Login(this.LoginObj).subscribe(res => {
      //   localStorage.setItem('token', res.accessToken); // store token
      //   console.log('Logged in successfully');
      // }, err => {
      //   console.log('Login failed', err);
      // });







      
    }




}


class LoginModel {
    email:string;
    password:string;

  constructor() {
    this.email = "",
    this.password = ""
  }
}