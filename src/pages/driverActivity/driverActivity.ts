import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Drivers } from '../../providers/drivers/drivers';
import { Driver } from '../../models/driver';
import { Stop } from '../../models/stop';

@Component({
  selector: 'page-driver',
  templateUrl: 'driverActivity.html',
  providers: [Drivers]
})
export class DriverActivityPage {
  public activity: Stop[];
  public currentDriver;

  constructor( private drivers: Drivers, private nav: NavController, private navParams: NavParams ){
    this.currentDriver = navParams.get('driver');
    this.drivers.fetchDriverStops(this.currentDriver).subscribe(
      data => {
        this.activity = data.json();
        console.log(this.activity);
      },
      err => {
        if( err.status == 404 ) {
          console.log('Not found');
        }
      },
      () => console.log('fetchDriverStops completed')
    )

    console.log( navParams.get('driver') )
  }
}