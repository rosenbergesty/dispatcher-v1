import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicStorageModule } from '@ionic/storage';
import { Network } from '@ionic-native/network';
import { Toast } from '@ionic-native/toast';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { DriverActivityPage } from '../pages/driverActivity/driverActivity';
import { LoginPage } from '../pages/login/login';
import { PopoverPage } from '../pages/popover/popover';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    DriverActivityPage,
    LoginPage,
    PopoverPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    HttpModule,
    IonicStorageModule.forRoot(),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    DriverActivityPage,
    LoginPage,
    PopoverPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Network,
    Toast,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
