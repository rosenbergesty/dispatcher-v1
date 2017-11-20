import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

import { Drivers } from '../../providers/drivers/drivers';

@Component({
  template: `
    <ion-list no-margin>
      <button ion-item (click)="delete()">Delete</button>
    </ion-list>
  `,
  providers: [Drivers]
})
export class PopoverPage {
  constructor(public viewCtrl: ViewController, public navParams: NavParams, public drivers: Drivers) { }
  delete(){
    console.log(this.navParams.data);
    this.delStop(this.navParams.data.ID);
    this.viewCtrl.dismiss();
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