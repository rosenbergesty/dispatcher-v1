import { Injectable } from '@angular/core';
import { HttpModule } from '@angular/http';
import { Http, Headers } from '@angular/http';

@Injectable()
export class Drivers {
  baseUrl = "http://estyrosenberg.com/guma/backend";
  constructor(private http: Http) {
  }

  fetchDrivers() {
    let drivers = this.http.get(this.baseUrl + `/fetch-all-drivers.php`);
    return drivers;
  }

  fetchDriverDetails(driver) {
    return this.http.post(this.baseUrl + '/fetch-driver-by-id.php', {id: driver.ID});
  }

  fetchDriverStops(driver) {
    return this.http.post(this.baseUrl + '/fetch-stops-by-driverId.php', {driverID: driver.ID}); 
  }
}