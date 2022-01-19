/*
This is a Node.js script that basically generates pseudo-random sampling of sensors to generate a telemetry flow landing to MQTT to simulate devices.
The user has to specify:
- Host and Port of the MQTT Broker;
- the number of messages, the interval of time between them and the number of devices he wants to simulate.

After the execution the broker will be generated a topic for every device specified in the number in the form of:
  JSTest/<device>/events/up

Messages will be a simulation of acquisition of limnimeters, so the physical features sampled will be:
  - idDevice: ID of the device
  - riverHeight: height of the river (like a limnimeter)
  - Temperature (°C) and Humidity (%RH): seriously, you need explaination?

Run this script after specified host and port of the MQTT broker running:
node ~/devicesMQTT.js

Andrea Bozzano - andrea.bozzano87@gmail.com
*/

// Initialization
const mqtt = require('mqtt');
const { exit } = require('process');

// Broker parameters:
const host = 'host'
const port = 'port'
const clientId = `mqtt_${Math.random().toString(16).slice(3)}` // random Client ID

// Traffic, complete this::
const nPackages = 35000; // number of packages to be generated
const waitTime = 0.5 + Math.random(); // time between two packages
const deviceNumber = 5; // number of simulated devices

// Connection to the MQTT Broker:
const connectUrl = `mqtt://${host}:${port}`
const client = mqtt.connect(connectUrl, {
    clientId,
    clean: true,
    connectTimeout: 4000,
    username: 'user',
    password: 'pwd',
    reconnectPeriod: 1000,
})

// Utility function to generate a int number between 0 and max
function randomInt(max) {
    return Math.floor(Math.random() * max);
}

// Build the JSON string to be sent to MQTT

function genMessage() {
    var idDevice = randomInt(deviceNumber);
    var riverHeight = randomInt(10);
    var temperature = randomInt(30) + Math.random() * 50;
    var humidity = randomInt(80) + Math.random();

    return '{ "idDevice": ' + idDevice + ', "riverHeight": ' + riverHeight + ', "temp": ' + temperature + ', "hum": ' + humidity + '}'
}

// Publish on topic
function pubMQTT(topic) {
    client.on('connect', () => {
        client.publish(topic, genMessage(), { qos: 0, retain: false }, (error) => {
            if (error) {
                console.error(error)
            }
        })
    })
}

// Routine that loops on nPackages to send every message on the topic specified
for (let i = 0; i < nPackages; i++) {

    setTimeout(function () {
        var id = randomInt(deviceNumber);
        topic = 'JSTest/' + id.toString() + '/events/up';
        pubMQTT(topic);
        //console.log('Publishing...');
    }, waitTime);
}
