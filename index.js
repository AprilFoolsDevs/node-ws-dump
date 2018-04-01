const r = require('./db');
const WebSocket = require('ws');
const config = require('./config.json');
const request = require('request');
const cheerio = require('cheerio');

const getURL = () => new Promise((resolve, reject) => {
  request(config.reddit, (err, res, body) => {
    if (err) reject(err);
    const $ = cheerio.load(body);
    const redditConfig = JSON.parse($('#config').text().slice(0, -1).substring(8));
    const wsurl = redditConfig[config.websocketKey];
    resolve(wsurl);
  });
});

const connect = () => {
  getURL().then((wsurl) => {
    const ws = new WebSocket(wsurl);
    console.log('Connecting to: ', wsurl);

    ws.on('message', (data) => {
      r.table('data').insert({
        data,
        date: new Date(),
      }).run();
    });

    ws.on('close', () => {
      connect();
    });
  });
};

connect();
