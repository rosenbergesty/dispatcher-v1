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

  fetchDriverStops(dispatcher, driver) {
    return this.http.post(this.baseUrl + '/fetch-stops-by-driver-dispatcher.php', {driverID: driver.ID, dispatcher: dispatcher}); 
  }

  addStop(driver, dispatcher, stop) {
    return this.http.post(this.baseUrl + '/add-stop.php', {driverID: driver, dispatcher: dispatcher, address: stop.address, action: stop.action, size: stop.size, date: stop.date, time: stop.time, comment: stop.comment});
  }

  deleteStop(stopId) {
    return this.http.post(this.baseUrl + '/deleteStop.php', {stop: stopId});
  }
}