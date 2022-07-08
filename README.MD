This application subscribes to events from a Unifi UDM/UDM Pro or UDM SE via unifi.js.
It serves a web page with a Leaflet map and plots IDS/IPS alerts on the map in real-time via socket.io.

To run you need to add an .env file and the following keys:

```
unifi_ip=192.168.10.1
unifi_user=localUdmAdminUsername
unifi_password='localUdmAdminPassword'
```

To run either use docker (see `docker_build.sh` and `docker_run.sh`) or via `node server.js`
Then navigate to http://your-ip:9999