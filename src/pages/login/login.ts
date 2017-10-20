import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Dispatcher } from '../../models/dispatcher';
import { Dispatchers } from '../../providers/dispatchers/dispatchers';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
  providers: [ Dispatchers ]
})
export class LoginPage {
  public user: Dispatcher;
  public password: any;
  public email: any;

  constructor(public navCtrl: NavController, public dispatchers: Dispatchers, public storage: Storage){

  }

  login() {
    // login
    this.dispatchers.loginDispatcher(this.email, this.password).subscribe(
      data => {
        let resp = data.json();
        if(resp.code == 200){
          // Save to storage
        }
      },
      err => {
        if( err.status == 404 ) {
          console.log('Not found');
        }
      },
      () => console.log('Login complete')
    );
    console.log('Email: ' + this.email + ' - Pass: ' + this.password);

  }
}