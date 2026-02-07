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
  navigate: any;
  
  constructor(
    private usersService: Users,
private router: Router 
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
          localStorage.setItem('token', fakeToken); 
          localStorage.setItem('user', 
            JSON.stringify({
              id : user.id,
              name : user.fullname,
              email:user.email,
              role:user.role
            })
          ); 
          alert("loged in")
          console.log('Login successful', user);
          // this.router.navigate([''])
        } else {
          alert('Invalid email or password')
          console.log('Invalid email or password');
        }
      });
  }

//   LoginButton() {
//   const faketoken = crypto.randomUUID() + crypto.randomUUID();
//   this.usersService.Login({
//     email: this.LoginObj.email,
//     password: this.LoginObj.password
//   }).subscribe({
//     next: (res) => {
//       // store token
//       localStorage.setItem('token', faketoken);

//       // store user info
//       // localStorage.setItem('user', 
//       //       JSON.stringify({
//       //         id : res.id,
//       //         name : res.fullname,
//       //         email:res.email,
//       //         role:res.role
//       //       }));
//       console.log('Login successful', res);

//       // navigate to home/dashboard
//       // this.router.navigate(['/']);
//     },
//     error: (err) => {
//       console.log('Login failed', err);
//       alert('Invalid email or password');
//     }
//   });
// }




}


class LoginModel {
    email:string;
    password:string;

  constructor() {
    this.email = "",
    this.password = ""
  }
}