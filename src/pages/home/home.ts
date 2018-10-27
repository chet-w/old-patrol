import { Component, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Chart } from 'chart.js';



declare var Paho: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})


export class HomePage {

  @ViewChild('chart') chart;

  // MQTT settings
  private mqttStatus: string = 'Disconnected';
  private mqttClient: any = null;
  // private message: any = '';
  private messageToSend: string = 'Your message';
  private topic: string = 'swen325/a3';
  private clientId: string = 'TestUser';
  private address = {
	  path: 'barretts.ecs.vuw.ac.nz',
	  port: 8883,
	  suffix: '/mqtt'
  };
  // private address = {
	//   path: 'localhost',
	//   port: 22389,
	//   suffix: '/mqtt'
  // };


  // App feilds
  private lastSeenLocation = { date: undefined, dateTime: undefined, time: undefined, room: undefined, isMovement: undefined, batteryLevel: undefined };
  private messageCount: number = 0;     // counts how many of the burst of five messages have been recieved
  private rooms = [               // Represents the rooms. 
    { date: undefined, dateTime: undefined, time: undefined, room:undefined, isMovement: undefined, batteryLevel: undefined },
    { date: undefined, dateTime: undefined, time: undefined, room:undefined, isMovement: undefined, batteryLevel: undefined },
    { date: undefined, dateTime: undefined, time: undefined, room:undefined, isMovement: undefined, batteryLevel: undefined },
    { date: undefined, dateTime: undefined, time: undefined, room:undefined, isMovement: undefined, batteryLevel: undefined },
    { date: undefined, dateTime: undefined, time: undefined, room:undefined, isMovement: undefined, batteryLevel: undefined }
   ];
  // index 0 = living, 
  // index 1 = kitchen,
  // index 2 = dining,
  // index 3 = toilet,
  // index 4 = bedroom

  // Counts for each room to populate chart
  private livingCount: number = 10;
  private kitchenCount: number = 10;
  private diningCount: number = 10;
  private toiletCount: number = 10;
  private bedroomCount: number = 10;

  public locationChart: any = undefined;

  




  constructor(public navCtrl: NavController) {
    this.connect();
    
  }

  // ================ Start tutorial slide content ================ 

  public connect = () => {
    this.mqttStatus = `Connecting to ${this.address.path}:${this.address.port}`;
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
    console.log('Connected?');
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
    this.handleResponse(message.payloadString);
    if(this.messageCount === 5){
      this.determineLastSeenRoom();
      this.locationChart = this.renderLocationChart();
    }
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

    if(response.room === "living"){
      this.rooms[0] = response;
    }else if(response.room === "kitchen"){
      this.rooms[1] = response;
    }else if(response.room === "dining"){
      this.rooms[2] = response;
    }else if(response.room === "toilet"){
      this.rooms[3] = response; 
    }else{
      this.rooms[4] = response; 
    }
    
    if(this.messageCount < 5){
      this.messageCount++
    }else{
      this.messageCount = 0
    }

  }

  public determineLastSeenRoom = () => {
    const room = this.rooms.find(el => {
      return el.isMovement === true
    });

    if(room.room == "living"){
      this.livingCount++;
    }if(room.room == "kitchen"){
      this.kitchenCount++;
    }if(room.room == "dining"){
      this.diningCount++;
    }if(room.room == "toilet"){
      this.toiletCount++;
    }if(room.room == "bedroom"){
      this.bedroomCount++;
    }
    
    

    if(room !== undefined){
      console.log(`Movement seen in ${room.room} ${room.dateTime}`);
      this.lastSeenLocation = room;
    }else{
      console.log(`No movement - last seen location: ${this.lastSeenLocation.room} ${this.lastSeenLocation.dateTime}`);
      
      const now = Date.now();
      const then = new Date(this.lastSeenLocation.dateTime).getTime();
         
      if(now - then  > 20000){  //300000
        alert("SEND A NOTIFICATION"); //testing
      }
    }
    
  }

  public renderLocationChart = () => {
    console.log("rendering...");
    const chart = new Chart(this.chart, {
      type: 'bar',
      data: {
        labels: ["Living Room", "Kitchen", "Dining Room", "Toilet", "Bedroom"],
        datasets: [{
          label: 'Times in Room',
          data: [this.livingCount, this.kitchenCount, this.diningCount, this.toiletCount, this.bedroomCount],
          backgroundColor: [
            "#E74C3C", "#A569BD", "#3498DB", "#27AE60", "#F39C12"
          ] 
        }]
      }
    });

    return chart;
  }


}


