const PORT = process.env.PORT || 5000
const HOST = '0.0.0.0';
const helmet = require('helmet')
const redis = require('redis');
const http = require('http');
import express from 'express';
const WebSocket = require('ws');

// const client = redis.createClient(6379, 'redis')
//
// client.on('error',  (err) => {
//   console.log('Error ' + err)
// })

const app = express();
app.use(helmet())
app.set('view engine', 'pug');
app.get('/', (req, res)=> {
  res.render('index', {title: 'Hello World', message:'Hello!'});
});

// app.get('/api', (req, res)=> {
//
//     client.hgetall('values', (err, obj)=>{
//       if(err) {
//         console.log(err);
//       } else {
//         res.json(obj);
//       }
//     });
//
// });
// app.get('/add', (req, res)=> {
//   client.hmset('values', { 'test': 'testing'});
//   res.redirect('/api');
// });
app.use(express.static('public'))

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
wss.on('connection', (ws, req)=> {
    ws.on('message', (message)=> {
      console.log('recieved', message);
    });
    ws.send('welcome');
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});
