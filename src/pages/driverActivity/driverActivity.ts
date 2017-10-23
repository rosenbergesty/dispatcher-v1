import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
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
      border-radius: 10px;
      padding: 1px 10px;
      position: relative;
    }
    .stop-msg::before {
      content: "";
      border-style: solid;
      border-width: 15px 12px 10px 2px;
      border-color: transparent #4a8aff transparent transparent;
      position: absolute;
      left: -14px;
      bottom: 8px;
    }                             
  `],
  providers: [Drivers]
})
export class DriverActivityPage {
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

  constructor( private drivers: Drivers, private nav: NavController, private navParams: NavParams, public storage: Storage ){
    this.currentDriver = navParams.get('driver');
    this.fetchStops();
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
}