import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

@Injectable()
export class Drivers {
  baseUrl = "http://estyrosenberg.com/guma/backend";
  constructor(private http: Http) {
  }

  fetchDrivers() {
    let drivers = this.http.get(this.baseUrl + `/fetch-all-drivers.php`);
    return drivers;
  }

  fetchSomeDrivers(count) {
    let drivers = this.http.post(this.baseUrl + `/fetch-drivers.php`, {count: count});
    return drivers;
  }

  countDrivers() {
    let count = this.http.get(this.baseUrl + `/count-drivers.php`);
    return count;    
  }

  fetchDriverDetails(driver) {
    return this.http.post(this.baseUrl + '/fetch-driver-by-id.php', {id: driver.ID});
  }

  fetchDriverStops(dispatcher, driver) {
    return this.http.post(this.baseUrl + '/fetch-stops-by-driver-dispatcher.php', {driverID: driver.ID, dispatcher: dispatcher}); 
  }

  fetchSomeDriverStops(dispatcher, driver, count, total) {
    return this.http.post(this.baseUrl + '/fetch-stops-by-count.php', {driverID: driver.ID, dispatcher: dispatcher, count: count, total: total}); 
  }

  addStop(driver, dispatcher, stop) {
    return this.http.post(this.baseUrl + '/add-stop.php', {driverID: driver, dispatcher: dispatcher, address: stop.address, action: stop.action, size: stop.size, date: stop.date, time: stop.time, comment: stop.comment});
  }

  deleteStop(stopId) {
    return this.http.post(this.baseUrl + '/delete-stop.php', {stopId: stopId});
  }
}