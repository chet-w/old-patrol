import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';



declare var Paho: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})


export class HomePage {

  // MQTT settings
  private mqttStatus: string = 'Disconnected';
  private mqttClient: any = null;
  private message: any = '';
  private messageToSend: string = 'Your message';
  private topic: string = 'swen325/a3';
  private clientId: string = 'yourName';
  private address = {
	  path: 'barretts.ecs.vuw.ac.nz',
	  port: 8883,
	  suffix: '/mqtt'
  };

  // Formatted room details
  private status = { kitchen: { date: "", dateTime: "", time: "", room: "kitchen", isMovement: "", batteryLevel: "" },
                     toilet: { date: "", dateTime: "", time: "", room: "toilet", isMovement: "", batteryLevel: "" },
                     living: { date: "", dateTime: "", time: "", room: "living", isMovement: "", batteryLevel: "" },
                     bedroom: { date: "", dateTime: "", time: "", room: "bedroom", isMovement: "", batteryLevel: "" } 
                    };

  private lastSeenTime = new Date(Date.now());
  private lastSeenRoom = this.status.kitchen;
  

  constructor(public navCtrl: NavController) {
    console.log(this.lastSeenRoom.room);
    this.connect();
    
  }

  // ================ Start tutorial slide content ================ 

  public connect = () => {
    this.mqttStatus = `Connecting to ${this.address.path}:${this.address.port}`;
    //this.mqttClient = new Paho.MQTT.Client('broker.mqttdashboard.com', 8000, '/mqtt', this.clientId);
    //this.mqttClient = new Paho.MQTT.Client('m15.cloudmqtt.com', 39634, '/mqtt', this.clientId);
    this.mqttClient = new Paho.MQTT.Client(this.address.path, this.address.port, this.address.suffix, this.clientId);


    // set callback handlers
    this.mqttClient.onConnectionLost = this.onConnectionLost;
    this.mqttClient.onMessageArrived = this.onMessageArrived;

    // connect the client
    console.log(`Connecting to ${this.address.path} via websocket ${this.address.port}`);
    //this.mqttClient.connect({timeout:10, userName:'ptweqash', password:'ncU6vlGPp1mN', useSSL:true, onSuccess:this.onConnect, onFailure:this.onFailure});
    this.mqttClient.connect({ timeout: 10, useSSL: false, onSuccess: this.onConnect, onFailure: this.onFailure });
  }

  public disconnect() {
    if (this.mqttStatus == 'Connected') {
      this.mqttStatus = 'Disconnecting...';
      this.mqttClient.disconnect();
      this.mqttStatus = 'Disconnected';
    }
  }

  public sendMessage() {
    if (this.mqttStatus == 'Connected') {
      this.mqttClient.publish(this.topic, this.messageToSend);
    }
  }

  public onConnect = () => {
    console.log('Connected');
    this.mqttStatus = 'Connected';

    // subscribe
    this.mqttClient.subscribe(this.topic);
  }

  public onFailure = (responseObject) => {
    console.log('Failed to connect');
    this.mqttStatus = 'Failed to connect';
  }

  public onConnectionLost = (responseObject) => {
    if (responseObject.errorCode !== 0) {
      this.mqttStatus = 'Disconnected';
    }
  }

  public onMessageArrived = (message) => {
    //console.log(message.payloadString);
    this.message = this.handleResponse(message.payloadString);
  }

  // ================ End tutorial slide content ================ 

  public handleResponse = (message: string) => {
    const parts = message.split(',');
    const dateTime = parts[0].split(' ');
    const response = {
      date: new Date(dateTime[0]).toDateString(),
      dateTime: parts[0],
      time: new Date(parts[0]).toLocaleTimeString('en-US'), //new Date(dateTime[1]).toLocaleTimeString(),
      room: parts[1],
      isMovement: parts[2] === '0' ? false : true,
      batteryLevel: parts[3]
    }
    this.assignResponses(response);
    //console.log(this.status);
    this.findLastSeen();
    return message;
  }

  public assignResponses = (response) => {
    if(response.room === "bedroom"){
      this.status.bedroom = response;
    }if(response.room === "kitchen"){
      this.status.kitchen = response;
    }if(response.room === "toilet"){
      this.status.toilet = response;
    }if(response.room === "living"){
      this.status.living = response;
    }
  }

  public findLastSeen = () => {
    const rooms = [];
    rooms.push(this.status.bedroom);
    rooms.push(this.status.kitchen);
    rooms.push(this.status.toilet);
    rooms.push(this.status.living);

    const lastSeenRoom = rooms.find(el => {
      return el.isMovement === true;
    });
    console.log(lastSeenRoom);
    if(lastSeenRoom !== undefined){
      this.lastSeenRoom = lastSeenRoom;
    }
    


    
    // const timeDiff = Math.abs(lastSeenRoom.dateTime.getTime() - this.lastSeenTime.getTime());
     
    
    //}
    

    // const timeDiff = Math.abs(lastSeen.getTime() - this.lastSeenTime.getTime())
    // console.log(timeDiff);


  }
}
