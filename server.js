const Unifi = require('unifi.js');
const dotenv = require('dotenv');

//express
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

//socket.io
const { Server } = require("socket.io");
const io = new Server(server);

dotenv.config();

const host = process.env.unifi_ip;
const port = 443;
const https = true;
const user = process.env.unifi_user; 
const password = process.env.unifi_password; 
const udm = true;

const MAX_EVENT_LIMIT = 100; //Max number of IDS/IDP events to remember and show on map

let _client = null;
let _alerts = [];

//Accept self signed SSL certificates on the UDM
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

//Shutdown unifi client on CTRL+C or docker shutdown
process.on('SIGINT', function() {
    if (_client !== null)
        _client.disconnect();

    process.exit();
});

Unifi.initialize( host, user, password, port, https, udm ).then( client => {
    _client = client;

    client.on('event', msg => {
        if (msg.data === null)
            return;

        if (msg.data.length < 1)
            return;

        if (msg.data[0].event_type !== 'alert')
            return;

        const alert = {
            ts: msg.data[0].datetime, 
            desc: msg.data[0].inner_alert_signature, 
            src: msg.data[0].src_ip + ':' + msg.data[0].src_port, 
            dest: msg.data[0].dest_ip + ':' + msg.data[0].dest_port,
            lat: msg.data[0].srcipGeo.latitude,
            lng: msg.data[0].srcipGeo.longitude,
            country: msg.data[0].srcipGeo.country_name,
            org: msg.data[0].srcipGeo.organization
        }

        console.log('======================================================================================');
        console.log('ts: ' + alert.ts);
        console.log('desc: ' + alert.desc);
        console.log('src: ' + alert.src);
        console.log('dest: ' + alert.dest);
        console.log('lat: ' + alert.lat);
        console.log('lng: ' + alert.lng);
        console.log('country: ' + alert.country);
        console.log('org: ' + alert.org);

        //Push new alart to history array, keep last 50 elements
        _alerts.push(alert);

        if (_alerts.length > MAX_EVENT_LIMIT)
            _alerts.shift();

        // Emit the alert to all connected clients
        io.emit('alert', alert); 
    });

    //Login to Unifi UDM, quit if not authenticated or connected afterwards
    client.authenticate().then(authenticated => {
        if (!authenticated || !client.connected) {
            console.log('Authenticated: ' + authenticated);
            console.log('Connected:' + client.connected);
            client.disconnect();
            return;
        }
    });
});

//Serve static files from wwwroot folder
app.use(express.static('wwwroot'));

//Setup socket.io
io.on('connection', (socket) => {
    //Send alert history when client emits load event
    socket.on('load', () => {
        _alerts.forEach(alert => {
            socket.emit('alert', alert); 
        });
    });
  });

server.listen(9999, () => {
    console.log('listening on *:9999');
});