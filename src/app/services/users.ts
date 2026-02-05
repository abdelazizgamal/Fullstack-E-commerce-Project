import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root',
})
export class Users {

  private baseUrl: string = 'http://localhost:3000/users';
  constructor(private http: HttpClient) { }


  Login(User: Users) {
    return this.http.post(this.baseUrl, User);
  }



}
