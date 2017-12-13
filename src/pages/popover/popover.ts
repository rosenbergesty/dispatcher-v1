import { Component, ViewChild } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { Drivers } from '../../providers/drivers/drivers';

@Component({
  template: `
    <ion-list no-margin>
      <button ion-item (click)="delete()">Delete</button>

      <button ion-item *ngIf="isPending" (click)="forward()">Forward</button>

      <ion-select #select [(ngModel)]="driver" (ionChange)="onChange()" [selectOptions]="selectOptions">
        <ion-option *ngFor="let driver of items" [value]="driver.ID">{{driver.name}}</ion-option>
      </ion-select>
    </ion-list>
  `,
  providers: [Drivers],
  selector: 'popover-page'
})
export class PopoverPage {
  public selectOptions = {};
  public items = [];
  public driver = '';
  public isPending = false;

  @ViewChild('select') select: 'select';

  constructor(public viewCtrl: ViewController, 
    public navParams: NavParams, public drivers: Drivers,
    public storage: Storage) { }
  
  ionViewDidLoad() {
    this.getDrivers(1000);
    this.selectOptions = {
      title: 'Forward Stop',
      subtitle: 'Select driver to forward stop'
    }

    if(this.navParams.data.status == 'pending'){
      this.isPending = true;
    }
  }
  delete(){
    this.delStop(this.navParams.data.ID);
    this.viewCtrl.dismiss();
  }

  forward(){
    console.log('forward');
    this.select.open();
  }

  onChange(){
    var date = new Date();
    var dateStr =  date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
    var time =  date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()
    this.drivers.forwardStop(this.navParams.data.ID, this.driver, this.navParams.data.type, this.navParams.data.address, dateStr, time).subscribe(
      data => {
        var resp = data.json();
        if(resp[0].code == 200){
          this.viewCtrl.dismiss();
        } else {
          console.log(data.json());
          console.log(data.json().data);
        }
      },
      err => {
        console.log(err);
      },
      () => {
        console.log('deleted');
      }
    );
  }

  getDrivers(count){
    this.drivers.fetchSomeDrivers(count).subscribe(
      data => {
        if(data.json() != '0 results'){
          this.storage.get('drivers').then((val) => {
            if(val == null){
              this.storage.set('drivers', data.json());
            } else {
              for(var i of data.json()) {
                this.items.push(i);
                val.push(i);
                this.storage.set('drivers', val);
              }
            }
          })
        } else {
          // this.emptyMsg = 'No results';
        }
      },
      err => console.error(err),
      () => console.log('getDrivers completed')
    ); 
  }

  delStop(stopId){
    this.drivers.deleteStop(stopId).subscribe(
      data => {
        var resp = data.json();
        if(resp[0].code == 200){
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