import { Component } from '@angular/core';
import { NavController, Platform, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Network } from '@ionic-native/network';
import { Dispatcher } from '../../models/dispatcher';
import { Dispatchers } from '../../providers/dispatchers/dispatchers';
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
  public connected: boolean;
  public invalid = false;

  constructor(public navCtrl: NavController, public dispatchers: Dispatchers, public storage: Storage, private network: Network, public alertCtrl: AlertController){
    this.storage.get('user').then((val) => {
      console.log(val);
      if(val != null){
        this.navCtrl.push(HomePage);
      }
    });
    this.checkNetwork();
  }

  checkNetwork() {
    if(this.network.type != 'none' && this.network.type != 'unknown'){
      this.connected = true;
    }
    let disconnectSubscription = this.network.onDisconnect().subscribe(() => {
      this.connected = false;
    });

    let connectSubscription = this.network.onConnect().subscribe(() => {
      setTimeout(() => {
        if(this.network.type != 'none'){
          this.connected = true;
        }
      }, 3000);
    });
  }

  login() {
    // login
    if(this.connected == true){   
      this.dispatchers.loginDispatcher(this.email, this.password).subscribe(
        data => {
          let resp = data.json();
          if(resp.code == 200){
            this.storage.set('user', resp.data[0]);
            this.navCtrl.push(HomePage);
            
          } else if (resp.code == 300){
            console.log('Wrong Password');
            this.invalid = true;
          } else if (resp.code == 400){
            console.log('Wrong username');
            this.invalid = true;
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
    } else {
      // Display connection error
      this.presentAlert();
    }
  }

  presentAlert() {
    var alert = this.alertCtrl.create({
      title: 'Offline',
      subTitle: 'You seem to be offline. Please check your connection and try again.',
      buttons: ['dismiss']
    });
    alert.present();
  }
}