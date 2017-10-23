import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Dispatcher } from '../../models/dispatcher';
import { Dispatchers } from '../../providers/dispatchers/dispatchers';
import { Storage } from '@ionic/storage';
import { HomePage } from '../home/home';

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
    // this.navCtrl.push(HomePage);

    // login
    this.dispatchers.loginDispatcher(this.email, this.password).subscribe(
      data => {
        let resp = data.json();
        if(resp.code == 200){
          this.storage.set('user', resp.data[0]);
          this.navCtrl.push(HomePage);
        } else if (resp.code == 300){
          console.log('Wrong Password');
        } else if (resp.code == 400){
          console.log('Wrong username');
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