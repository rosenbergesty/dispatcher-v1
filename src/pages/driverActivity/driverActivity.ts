import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Drivers } from '../../providers/drivers/drivers';

@Component({
  selector: 'page-driver',
  templateUrl: 'driverActivity.html',
  providers: [Drivers]
})
export class DriverActivityPage {
  public activity = '';
  public currentDriver;

  constructor( private drivers: Drivers, private nav: NavController, private navParams: NavParams ){
    this.currentDriver = navParams.get('driver');
    this.drivers.fetchDriverDetails(this.currentDriver).subscribe(
      data => {
        this.activity = data.toString();
         console.log(data);
      },
      err => {
        if( err.status == 404 ) {
          this.activity = 'Not found'
        }
      },
      () => console.log('fetchDriverDetails completed')
    )

    console.log( navParams.get('driver') )
  }
}