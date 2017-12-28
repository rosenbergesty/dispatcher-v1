import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

@Injectable()
export class Dispatchers {
  baseUrl = "http://gumadispatch.com/backend";
  constructor(private http: Http) {
  }

  loginDispatcher(email, password) {
    let user = this.http.post(this.baseUrl + `/login-dispatcher.php`, {username: email, password: password});
    return user;
  }
}