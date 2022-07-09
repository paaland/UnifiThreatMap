#!/bin/bash
docker stop unifithreatmap 
docker rm unifithreatmap
docker run -d --name unifithreatmap \
       -p 9999:9999 \
       -e unifi_ip=<UnifiLanIp> \
       -e unifi_username=<UnifiLocalAdminUserName> \
       -e unifi_password='<UnifiLocalAdminPassword>' \
       unifithreatmap:latest
docker logs -f unifithreatmap