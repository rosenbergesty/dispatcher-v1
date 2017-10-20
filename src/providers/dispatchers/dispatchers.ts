import { Injectable } from '@angular/core';
import { HttpModule } from '@angular/http';
import { Http, Headers } from '@angular/http';

@Injectable()
export class Dispatchers {
  baseUrl = "http://estyrosenberg.com/guma/backend";
  constructor(private http: Http) {
  }

  loginDispatcher(email, password) {
    let user = this.http.post(this.baseUrl + `/login-dispatcher.php`, {username: email, password: password});
    return user;
  }
}