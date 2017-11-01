import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Drivers } from '../../providers/drivers/drivers';
import { DriverActivityPage } from '../driverActivity/driverActivity';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';

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
    console.log(this.drivers.fetchDrivers());
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

  doInfinite(infiniteScroll){
    this.drivers.fetchDrivers().subscribe(
      data => {
        for(let driver of data.json()){
          this.fetchedDrivers.push(driver);
        }

        infiniteScroll.complete();
      },
      err => console.error(err),
      () => console.log('getDrivers completed')
    );
  }

  /* Search */
  onInput(event){
    console.log('input');
  }
  onCancel(event){
    console.log('cancel');
  }

}
