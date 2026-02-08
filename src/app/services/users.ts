import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../Core/Interfaces/user.model';
import { Observable } from 'rxjs';
// import {LoginModel} fro

@Injectable({
  providedIn: 'root',
})
export class Users {
  private readonly baseUrl: string = 'http://localhost:3000';
  constructor(private http: HttpClient) {}

  getUserByEmail(email: string) {
    const q = encodeURIComponent(email.trim().toLowerCase());
    return this.http.get<User[]>(`${this.baseUrl}/users?email=${q}`);
  }

  createUser(user: User | null) {
    return this.http.post<User>(`${this.baseUrl}/users`, user);
  }

  Login(User: { email: string; password: string }) {
    return this.http.post(`${this.baseUrl}/login`, User);
  }

  get_user() {
    console.log('used in service');

    return this.http.get<any>(`${this.baseUrl}/users`);
  }

  updateUser(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/users/${id}`, user);
  }
}
