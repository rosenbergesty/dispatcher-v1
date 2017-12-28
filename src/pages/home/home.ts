import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Network } from '@ionic-native/network';
import { Toast } from '@ionic-native/toast';

import { Drivers } from '../../providers/drivers/drivers';
import { DriverActivityPage } from '../driverActivity/driverActivity';
import { LoginPage } from '../login/login';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [Drivers]
})
export class HomePage {

  public items = [];
  public fetchedDrivers = [];
  public fullDrivers = [];
  public username;
  public emptyMsg;
  public searchQuery: string = '';

  constructor(public navCtrl: NavController, 
    private drivers: Drivers, private storage: Storage, 
    private network: Network, public alertCtrl: AlertController, 
    private toast: Toast) {
    this.storage.get('user').then((val) => {
      if(val == null){
        this.navCtrl.push(LoginPage);
      } else {
        this.checkDrivers();
      }
    });
  }

  checkDrivers() {
    this.storage.get('drivers').then((val) => {
      if(val == null){
        this.getAllDrivers();
      } else {

        // Display drivers
        this.fetchedDrivers = val;
        this.items = val;

        // Compare to online
        this.checkNetwork();

        if(this.connected == true){

          this.fetchedDrivers = [];
          this.storage.remove('drivers');
          this.getAllDrivers();
        } else {
          this.toast.show(`Error loading new drivers. Check your connection.`, '5000', 'center').subscribe(
            toast => {
              console.log(toast);
            })
          this.emptyMsg = 'Could not load data. Connection error.';          
        }
      }
    });
  }

  getAllDrivers() {
    var count = 0;
    var total = 0;
    this.checkNetwork();

    if(this.connected == true){
      this.drivers.countDrivers().subscribe(
        data => {
          total = data.json();
          while(count < total){
            count += 30;
            this.drivers.fetchSomeDrivers(count).subscribe(
              data => {
                if(data.json() != '0 results'){
                  this.storage.get('drivers').then((val) => {
                    if(val == null){
                      this.storage.set('drivers', data.json());
                      this.fetchedDrivers = data.json();
                      this.items = data.json();
                    } else {
                      for(var i of data.json()) {
                        this.fetchedDrivers.push(i);
                        this.items.push(i);
                        val.push(i);
                        this.storage.set('drivers', val);
                      }
                    }
                  })
                } else {
                  this.emptyMsg = 'No results';
                }
              },
              err => console.error(err),
              () => {}
            ); 
          }
        }, 
        err => {
          console.log(err);
        },
        () => {}
      );
    } else {
      this.connectionAlert();
      this.emptyMsg = 'Could not load data. Connection error.'
    }
  }

  getDrivers(count){
    this.checkNetwork();
    if(this.connected == true){
      this.drivers.fetchSomeDrivers(3).subscribe(
        data => {
          if(data.json() != '0 results'){
            this.storage.get('drivers').then((val) => {
              if(val == null){
                this.storage.set('drivers', data.json());
              } else {
                for(var i of data.json()) {
                  this.fetchedDrivers.push(i);
                  this.items.push(i);
                  val.push(i);
                  this.storage.set('drivers', val);
                }
              }
            })
          } else {
            this.emptyMsg = 'No results';
          }
        },
        err => console.error(err),
        () => {}
      ); 
    } else {
      this.toast.show(`Error loading new drivers. Check your connection.`, '5000', 'center').subscribe(
        toast => {
          console.log(toast);
        })
      this.emptyMsg = 'Could not load data. Connection error.';
    }

  }

  driverActivity(driver) {
    this.navCtrl.push(DriverActivityPage, { driver: driver });
  }

  /* Search */
  onInput(event){
    this.fetchedDrivers = this.items;
    let val = event.target.value;
    if (val && val.trim() != ''){
      this.fetchedDrivers = this.fetchedDrivers.filter((item) => {
        return ((item['name'].toLowerCase().indexOf(val.toLowerCase()) > -1) || (item['email'].toLowerCase().indexOf(val.toLowerCase()) > -1) ) 
      })      
    }
  }
  onCancel(event){
    console.log('cancel');
  }

  /* Network */
  public connected: boolean;
  checkNetwork() {
    if(this.network.type != 'none' && this.network.type != 'unknown'){
      this.connected = true;
    }
    let disconnectSubscription = this.network.onDisconnect().subscribe(() => {
      this.connected = false;
      this.connected = true;
    });

    let connectSubscription = this.network.onConnect().subscribe(() => {
      setTimeout(() => {
        if(this.network.type != 'none'){
          this.connected = true;
        }
      }, 3000);
    });
  }
  connectionAlert() {
    var alert = this.alertCtrl.create({
      title: 'Offline',
      subTitle: 'You seem to be offline. Please check your connection and try again.',
      buttons: ['dismiss']
    });
    alert.present();
  }

}
