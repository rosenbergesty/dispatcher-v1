import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Drivers } from '../../providers/drivers/drivers';
import { DriverActivityPage } from '../driverActivity/driverActivity';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [Drivers]
})
export class HomePage {

  public fetchedDrivers;
  public username;

  constructor(public navCtrl: NavController, private drivers: Drivers) {
    this.getDrivers();
  }

  getDrivers() {
    this.drivers.fetchDrivers().subscribe(
      data => {
        this.fetchedDrivers = data.json()
      },
      err => console.error(err),
      () => console.log('getDrivers completed')
    );
  }

  driverActivity(driver) {
    this.navCtrl.push(DriverActivityPage, { driver: driver });
  }

}
