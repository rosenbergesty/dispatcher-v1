import { Component, ViewChild, NgZone } from '@angular/core';
import { NavController, NavParams, AlertController, PopoverController, LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Network } from '@ionic-native/network';
import { Toast } from '@ionic-native/toast';
import { } from '@types/googlemaps';

import { Drivers } from '../../providers/drivers/drivers';
import { Driver } from '../../models/driver';
import { Stop } from '../../models/stop';
import { PopoverPage } from '../popover/popover';


@Component({
  selector: 'page-driver',
  templateUrl: 'driverActivity.html',
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

  public connected = false;

  public autocomplete;
  public autocompleteItems;
  public service = new google.maps.places.AutocompleteService();

  constructor( private drivers: Drivers, private nav: NavController, private navParams: NavParams, public storage: Storage, private network: Network, public alertCtrl: AlertController, private toast: Toast, private zone: NgZone, public popoverCtrl: PopoverController, public loadingCtrl: LoadingController ){
    this.currentDriver = navParams.get('driver');
    this.checkNetwork();
    this.fetchLatestStops();

    this.autocompleteItems = [];
    this.autocomplete = {
      query: ''
    };
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

                this.content.scrollToBottom(300);
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

  /* Delete Stop */
  onHold(event, stop){
    let popover = this.popoverCtrl.create(PopoverPage, stop);
    popover.present({
      ev: event
    });
    popover.onDidDismiss(data => {
      this.fetchLatestStops();
    });
  }

  /* Address Autcomplete */
  dismiss() {

  }

  chooseItem(item: any) {
    console.log(item);
    this.autocomplete.query = item;
    this.autocompleteItems = [];
    this.address = item;
  }
  
  updateSearch() {
    if (this.autocomplete.query == '') {
      this.autocompleteItems = [];
      return;
    }
    let me = this;
    this.service.getPlacePredictions({ input: this.autocomplete.query, componentRestrictions: {country: 'US'} }, function (predictions, status) {
      me.autocompleteItems = []; 
      me.zone.run(function () {
        predictions.forEach(function (prediction) {
          me.autocompleteItems.push(prediction.description);
        });
      });
    });
  }

  addStop(){
    // Show error if not valid
    var valid = true;
    if(this.address.length < 1){
      console.log('Address');
      valid = false;
    }

    let loading = this.loadingCtrl.create({
      content: 'Adding stop...'
    });

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
        loading.present();
        this.drivers.addStop(this.currentDriver.ID, val.ID, stop).subscribe(
          data => {
            console.log(data.json());
            var resp = data.json()[0];
            if(resp.code == '200'){
              this.fetchLatestStops();
              this.address = '';
              this.autocomplete.query = '';
            }
            loading.dismiss();
            this.content.scrollToBottom(100);
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