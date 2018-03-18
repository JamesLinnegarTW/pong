const PORT = process.env.PORT || 5000
const HOST = '0.0.0.0';
const helmet = require('helmet')
const redis = require('redis');

import express from 'express';
import World from './world';

const client = redis.createClient(6379, 'redis')

client.on('error',  (err) => {
  console.log('Error ' + err)
})

const app = express();
app.use(helmet())
app.get('/api', (req, res)=> {
    let values = [];
    client.hgetall('values', (err, obj)=>{
      if(err) {
        console.log(err);
      } else {
        res.json(obj);
      }
    })
});
app.get('/add', (req, res)=> {
  client.hmset('values', { 'test': 'testing'});
  res.redirect('/api');
});
app.use(express.static('public'))

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});
