import { Component, ViewChild, NgZone } from '@angular/core';
import { NavController, NavParams, AlertController, Content, PopoverController, LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Network } from '@ionic-native/network';
import { } from '@types/googlemaps';

import { Drivers } from '../../providers/drivers/drivers';
import { Stop } from '../../models/stop';
import { PopoverPage } from '../popover/popover';


@Component({
  selector: 'page-driver',
  templateUrl: 'driverActivity.html',
  providers: [Drivers]
})
export class DriverActivityPage {
  @ViewChild('content') content: Content;
  public activity: Stop[] = [];
  public daysActivity: any[] = [];
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

  public currentDate: Date;

  constructor( private drivers: Drivers, 
    private navParams: NavParams, 
    public storage: Storage, private network: Network, 
    public alertCtrl: AlertController, private zone: NgZone, 
    public popoverCtrl: PopoverController, 
    public loadingCtrl: LoadingController ){
    this.currentDriver = navParams.get('driver');
    this.checkNetwork();
    this.fetchLatestStops();

    this.autocompleteItems = [];
    this.autocomplete = {
      query: ''
    };
  }

  scrollBottom() {
    setTimeout(() => {
      this.content.scrollToBottom(200);
    }, 500);
  }

  fetchLatestStops(){
    var curDay = new Date();
    var today = new Date();
    var count = 0;
    this.storage.get('stops'+this.currentDriver.ID).then((val) => {
      
      if(val != null){
        val.forEach(stop => {
          var dateString = stop.date;
          var dateParts = dateString.split("/");
          var date = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
          date.setHours(0);
          date.setMinutes(0);
          date.setSeconds(0, 0);
          today.setHours(0);
          today.setMinutes(0);
          today.setSeconds(0, 0);

          if(count == 0){
            this.currentDate = date;
          }
          count ++;

          if(date.getTime() == curDay.getTime()){
            console.log('same');
            this.daysActivity[this.daysActivity.length - 1].stops.push(stop);
          } else {
            var timeDiff = date.getTime() - today.getTime();
            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
            curDay = date;

            if(diffDays == 0){
              this.daysActivity.push({date: "Today", stops: [stop]});
            } else if(diffDays == -1){
              this.daysActivity.push({date: "Yesterday", stops: [stop]});
            } else {
              var monthNames = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
              ];
              this.daysActivity.push({date: monthNames[curDay.getMonth()] + ' ' + curDay.getDate(), stops: [stop]});
            }
          }
        })

        this.loader = false;
        this.empty = false;
        this.loaded = true;

        this.scrollBottom();
      }

      if(this.connected == true){
        var count = 10;
        var counter = 0;
        this.daysActivity = [];
        curDay = new Date();
        this.storage.get('user').then((val) => {
          this.drivers.fetchSomeDriverStops(val.ID, this.currentDriver, count, 0).subscribe(
            data => {
              this.activity = data.json();
              if(data.json() == '0 results'){
                this.loader = false;
                this.empty = true;

                this.content.scrollToBottom(300);
              } else {
                this.loader = false;
                this.empty = false;
                this.loaded = true;

                data.json().forEach(stop => {
                  var dateString = stop.date;
                  var dateParts = dateString.split("/");
                  var date = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
                  date.setHours(0);
                  date.setMinutes(0);
                  date.setSeconds(0, 0);
                  today.setHours(0);
                  today.setMinutes(0);
                  today.setSeconds(0, 0);

                  if(counter == 0){
                    this.currentDate = date;
                  }
                  counter ++;

                  if(date.getTime() == curDay.getTime()){
                    console.log('same');
                    this.daysActivity[this.daysActivity.length - 1].stops.push(stop);
                  } else {
                    var timeDiff = date.getTime() - today.getTime();
                    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                    curDay = date;

                    if(diffDays == 0){
                      console.log('today');
                      this.daysActivity.push({date: "Today", stops: [stop]});
                    } else if(diffDays == -1){
                      this.daysActivity.push({date: "Yesterday", stops: [stop]});
                    } else {
                      var monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"
                      ];
                      this.daysActivity.push({date: monthNames[curDay.getMonth()] + ' ' + curDay.getDate(), stops: [stop]});
                    }
                  }
                })

                this.storage.set('stops' + this.currentDriver.ID, data.json());

                this.scrollBottom();
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
    var curDay = new Date();
    var today = new Date();
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
            var counter = 0;

            data.json().forEach(stop => {
              var dateString = stop.date;
              var dateParts = dateString.split("/");
              var date = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
              date.setHours(0);
              date.setMinutes(0);
              date.setSeconds(0, 0);
              today.setHours(0);
              today.setMinutes(0);
              today.setSeconds(0, 0);

              if(counter == 0){
                this.currentDate = stop.date;
              }
              counter ++;

              if(date.getTime() == curDay.getTime()){
                console.log('same');
                this.daysActivity[this.daysActivity.length - 1].stops.push(stop);
              } else {
                var timeDiff = date.getTime() - today.getTime();
                var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                curDay = date;

                if(diffDays == 0){
                  console.log('today');
                  this.daysActivity.push({date: "Today", stops: [stop]});
                } else if(diffDays == -1){
                  this.daysActivity.push({date: "Yesterday", stops: [stop]});
                } else {
                  var monthNames = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                  ];
                  this.daysActivity.push({date: monthNames[curDay.getMonth()] + ' ' + curDay.getDate(), stops: [stop]});
                }
              }
            })
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
    this.service.getPlacePredictions({ input: this.autocomplete.query, 
      componentRestrictions: {country: 'US'} }, 
      function (predictions, status) {
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
    var today = new Date();
    var curDay = this.currentDate;

    this.storage.get('user').then((val) => {
      this.drivers.fetchSomeDriverStops(val.ID, this.currentDriver, count, total).subscribe(
        data => {
          console.log(data.json());
          if(data.json() == '0 results'){
            console.log('none');
          } else {
            var dataArr = data.json().reverse();
            for(var i of dataArr){
              var dateString = i.date;
              var dateParts = dateString.split("/");
              var date = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
              date.setHours(0);
              date.setMinutes(0);
              date.setSeconds(0, 0);
              today.setHours(0);
              today.setMinutes(0);
              today.setSeconds(0, 0);

              if(date.getTime() == curDay.getTime()){
                this.daysActivity[0].stops.unshift(i);
              } else {
                var timeDiff = date.getTime() - today.getTime();
                var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                curDay = date;

                if(diffDays == 0){
                  console.log('today');
                  this.daysActivity.unshift({date: "Today", stops: [i]});
                } else if(diffDays == -1){
                  this.daysActivity.unshift({date: "Yesterday", stops: [i]});
                } else {
                  var monthNames = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                  ];
                  this.daysActivity.unshift({date: monthNames[curDay.getMonth()] + ' ' + curDay.getDate(), stops: [i]});
                }
              }

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