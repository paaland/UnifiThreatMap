FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

#RUN npm install
RUN npm ci --only=production

# Bundle app source
COPY server.js .
COPY .env .
COPY wwwroot wwwroot

EXPOSE 9999
CMD [ "node", "server.js" ]
