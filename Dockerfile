FROM nikolaik/python-nodejs:latest AS ui-build

WORKDIR /usr/app/
COPY client/package*.json ./
RUN npm install

COPY client ./
WORKDIR /usr/app/client
RUN npm run build

FROM nikolaik/python-nodejs:latest AS server-build

WORKDIR /usr/app/

COPY --from=ui-build /usr/app/build ./client/build/
WORKDIR /usr/app/server

COPY server/package*.json ./
RUN npm install

COPY server ./

COPY requirements.txt ./
RUN pip install -r requirements.txt

ENV NODE_ENV=production

EXPOSE 5015

VOLUME ["./scripts:/usr/app/server/scripts"]

CMD ["node", "server.js"]
