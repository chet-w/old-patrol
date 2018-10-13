import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { initPush, sendNotification } from '../../assets/js/push.js';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  private publicVapid = "BHfGc0Oy3PprPrlqrTzrjxuTQ6UW_Q-Nehsu81pKRQI7ZkNSNuH7Lu5q1NtmIg-xBVmU6jSxDKrPjzeAhsu58F0";


  constructor(public navCtrl: NavController) {
    if ("serviceWorker" in navigator) {
      initPush();
      this.send().catch(err => console.error(err));
    }
  }

  /**
   * Prepare and send notifcation
   */
  async send() {
    console.log("Registering Service Worker...")
    const register = await navigator.serviceWorker.register('../../assets/js/worker.js');
    console.log("Registered Service Worker")


    console.log("Registering Push...");
    const subscription = await register.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this.urlBase64ToUint8Array(this.publicVapid)
    });
    console.log("Push Registered");

    await sendNotification(subscription)
  }


  /**
   * Convert URL safe string to arrary to be processed and used by push notification
   * @param base64String 
   */
  urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }


}
