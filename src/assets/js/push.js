
import * as webPush from 'web-push';


//  Vapid Keys
const publicVapid  = "BHfGc0Oy3PprPrlqrTzrjxuTQ6UW_Q-Nehsu81pKRQI7ZkNSNuH7Lu5q1NtmIg-xBVmU6jSxDKrPjzeAhsu58F0";
const privateVapid = "u9sE7RnyyEd1DAc2wDqLEvQcx9IyjIQr0x_ZAGkPOqM"

export function initPush() {
    console.log("Initialising...")
    webPush.setVapidDetails("mailto:chethana96@gmail.com", publicVapid, privateVapid);
    console.log("Initialised")
}


// Send notication
export function sendNotification(subscription){
    console.log(subscription);

    const payload = JSON.stringify({ title: "Push Test" });
    webPush.sendNotification(subscription, payload).then(() => {
        console.log("Sent notification");
    }).catch(err => {
        console.error(err);
    });
}