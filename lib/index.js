const PORT = process.env.PORT || 5000
const HOST = '0.0.0.0';
const helmet = require('helmet')
const http = require('http');
import express from 'express';
const WebSocket = require('ws');

const app = express();
app.use(helmet())
app.set('view engine', 'pug');
// app.get('/', (req, res)=> {
//   res.render('index', {title: 'Hello World', message:'Hello and welcome!'});
// });

app.use(express.static('client/build'));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
wss.on('connection', (ws, req)=> {
    ws.on('message', (message)=> {
      console.log('recieved', message);
      ws.send(message);
    });

});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});
