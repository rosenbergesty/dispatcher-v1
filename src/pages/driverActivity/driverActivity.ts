import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Network } from '@ionic-native/network';
import { Toast } from '@ionic-native/toast';

import { Drivers } from '../../providers/drivers/drivers';
import { Driver } from '../../models/driver';
import { Stop } from '../../models/stop';

@Component({
  selector: 'page-driver',
  templateUrl: 'driverActivity.html',
  styles: [`
    .segment-md ion-segment-button.segment-button {
      padding: 0 0;
    }
    .text-input-ios{
      margin: 5px 8px 5px 0;
    }
    .label-ios{
      margin: -5px 8px 11px 0;
    }
    button.disable-hover.bar-button.bar-button-ios.bar-button-default.bar-button-default-ios.bar-button-ios-royal {
      position: relative;
      top: -10px;
    }
    .stop-msg {
      background: #498aff;
      margin: 10px 10px 10px 15px;
      border-radius: 0 20px 20px 20px;
      padding: 1px 10px;
      position: relative;
    }   
    .stop-msg.complete{
      background: #4caf50
    }                     
  `],
  providers: [Drivers]
})
export class DriverActivityPage {
  @ViewChild('content') content: any;
  public activity: Stop[];
  public currentDriver;
  public hasComment = false;

  public address = "";
  public size = "10";
  public action = "do";
  public comment = "";

  public loaded = false;
  public loader = true;
  public empty = false;

  public num: number[];

  constructor( private drivers: Drivers, private nav: NavController, private navParams: NavParams, public storage: Storage, private network: Network, public alertCtrl: AlertController, private toast: Toast ){
    this.currentDriver = navParams.get('driver');
    this.checkNetwork();
    this.fetchLatestStops();
  }

  fetchLatestStops(){
    this.storage.get('stops'+this.currentDriver.ID).then((val) => {
      
      if(val != null){
        this.activity = val;

        this.loader = false;
        this.empty = false;
        this.loaded = true;

        this.content.scrollToBottom(100);
      }

      if(this.connected == true){
        var count = 10;
        this.storage.get('user').then((val) => {
          this.drivers.fetchSomeDriverStops(val.ID, this.currentDriver, count, 0).subscribe(
            data => {
              console.log(data.json());
              if(data.json() == '0 results'){
                this.loader = false;
                this.empty = true;
              } else {
                this.activity = data.json();
                this.storage.set('stops' + this.currentDriver.ID, data.json());

                console.log(data.json());

                this.loader = false;
                this.empty = false;
                this.loaded = true;

                this.content.scrollToBottom(300);
              }
            },
            err => {
              if( err.status == 404 ) {
                console.log('Not found');
              }
            },
            () => console.log('fetchDriverStops completed')
          )
        })
      } else {
        this.connectionAlert();
      }
    });
  }
  fetchStops(){
    this.storage.get('user').then((val) => {
      this.drivers.fetchDriverStops(val.ID, this.currentDriver).subscribe(
        data => {
          if(data.json() == '0 results'){
            this.loader = false;
            this.empty = true;
          } else {
            this.activity = data.json();
            this.loader = false;
            this.empty = false;
            this.loaded = true;
          }
        },
        err => {
          if( err.status == 404 ) {
            console.log('Not found');
          }
        },
        () => console.log('fetchDriverStops completed')
      )
    });
  }

  toggleComment(){
    console.log('toggling');
    this.hasComment = !this.hasComment;
  }

  addStop(){
    // Show error if not valid
    var valid = true;
    if(this.address.length < 1){
      console.log('Address');
      valid = false;
    }

    // Save to db
    if(valid){
      var date = new Date();
      var stop = {
        address: this.address,
        size: this.size,
        action: this.action,
        comment: this.comment,
        date: date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear(),
        time: date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()
      }
      this.storage.get('user').then((val) => {
        this.drivers.addStop(this.currentDriver.ID, val.ID, stop).subscribe(
          data => {
            console.log(data);
          },
          err => {
            console.log(err);
          },
          () => {
            console.log('Stop Added');
          }
        );

      })
    }
  }

  delStop(stopId){
    console.log(stopId);
    this.drivers.deleteStop(stopId).subscribe(
      data => {
        console.log(data);
        if(data.json().code == 200){
          this.fetchStops();
        } else {
          console.log(data.json().data);
        }
      },
      err => {
        console.log(err);
      },
      () => {
        console.log('deleted');
      })
  }

  /* Load More */
  onLoadMore(event){
    console.log('load more');
    var total = this.activity.length;
    var count = 10;

    this.storage.get('user').then((val) => {
      this.drivers.fetchSomeDriverStops(val.ID, this.currentDriver, count, total).subscribe(
        data => {
          console.log(data.json());
          if(data.json() == '0 results'){
            console.log('none');
          } else {
            for(var i of data.json()){
              this.activity.unshift(i);
            }
          }
        },
        err => {
          if( err.status == 404 ) {
            console.log('Not found');
          }
        },
        () => console.log('fetchDriverStops completed')
      )
    })

    event.complete();
  }

  /* Network */
  public connected: boolean;
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
  connectionAlert() {
    var alert = this.alertCtrl.create({
      title: 'Offline',
      subTitle: 'You seem to be offline. Please check your connection and try again.',
      buttons: ['dismiss']
    });
    alert.present();
  }

}