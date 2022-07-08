#!/bin/bash
docker stop unifithreatmap 
docker rm unifithreatmap
docker run -d --name unifithreatmap -p 9999:9999 unifithreatmap:latest
docker logs -f unifithreatmap
