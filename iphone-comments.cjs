// Node.js 22+. Uses only built-in modules.
'use strict';
const http = require('node:http');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');

if (typeof WebSocket !== 'function') {
  console.error('Can cai Node.js 22 tro len, roi mo lai file CMD.');
  process.exit(1);
}
const port = 21314;
const token = crypto.randomBytes(12).toString('hex');
const prefix = '/' + token + '/';
const addresses = Object.values(os.networkInterfaces()).flat().filter(
  item => item.family === 'IPv4' && !item.internal &&
    /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(item.address)
).map(item => item.address);
if (!addresses.length) {
  console.error('Chua tim thay IPv4 mang noi bo. Kiem tra Wi-Fi hoac day LAN.');
  process.exit(1);
}
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8')
  .replace('<head>', '<head><meta name="cafe-lan-comments" content="1">');
const css = fs.readFileSync(path.join(__dirname, 'styles.css'));
function listenForComments(res) {
  const upstream = new WebSocket('ws://127.0.0.1:21213/');
  let heartbeat;
  let closed = false;
  function close() {
    if (closed) return;
    closed = true;
    clearInterval(heartbeat);
    upstream.close();
    if (!res.headersSent) res.writeHead(503);
    else if (!res.destroyed) res.write('event: offline\ndata: {}\n\n');
    res.end();
  }
  res.on('close', close);
  upstream.addEventListener('error', close);
  upstream.addEventListener('close', close);
  upstream.addEventListener('open', () => {
    if (closed) return;
    res.writeHead(200, {'Content-Type':'text/event-stream','Cache-Control':'no-store'});
    res.write(': connected\n\n');
    heartbeat = setInterval(() => res.write(': ping\n\n'), 15000);
  });
  upstream.addEventListener('message', ({data}) => {
    if (closed || typeof data !== 'string') return;
    let packet;
    try { packet = JSON.parse(data); } catch { return; }
    if (packet?.event !== 'chat' || typeof packet.data?.comment !== 'string') return;
    res.write('data: ' + JSON.stringify(packet) + '\n\n');
    if (res.writableLength > 262144) close();
  });
}
const server = http.createServer((req, res) => {
  const host = req.headers.host;
  const validHost = addresses.some(ip => host === ip + ':' + port);
  if (req.method !== 'GET' || !validHost || !req.url.startsWith(prefix) ||
      (req.headers.origin && req.headers.origin !== 'http://' + host)) {
    res.writeHead(404).end(); return;
  }
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cache-Control', 'no-store');
  switch (req.url.slice(prefix.length)) {
    case '': res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'}).end(html); break;
    case 'styles.css': res.writeHead(200, {'Content-Type':'text/css; charset=utf-8'}).end(css); break;
    case 'comments': listenForComments(res); break;
    default: res.writeHead(404).end();
  }
});
server.on('error', error => { console.error(error.message); process.exit(1); });
server.listen(port, '0.0.0.0', () => {
  console.log('Mo dia chi cua card Wi-Fi/LAN nay trong Safari tren iPhone:');
  addresses.forEach(ip => console.log('http://' + ip + ':' + port + prefix));
  console.log('Giu cua so nay va TikFinity Desktop mo trong buoi LIVE.');
});
