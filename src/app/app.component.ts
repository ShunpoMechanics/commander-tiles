import { Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertController, IonModal, Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  

  private initPlugin: boolean;
  constructor(private platform: Platform,private http: HttpClient, private alertController: AlertController) {

   }

}
