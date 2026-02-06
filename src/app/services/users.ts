import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import {LoginModel} fro

@Injectable({
  providedIn: 'root',
})
export class Users {


  
  private baseUrl: string = 'http://localhost:3000';
  constructor(private http: HttpClient) { }


  Login(User: {email: string, password: string}) {
    return this.http.post(`${this.baseUrl}/login`, User);
  }

  get_user() {
    return this.http.get<any>(`${this.baseUrl}/users`);
  }






}
