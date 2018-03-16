const PORT = process.env.PORT || 5000
const HOST = '0.0.0.0';
const helmet = require('helmet')

import express from 'express';
import World from './world';

const app = express();
app.use(helmet())
app.get('/', (req, res) => {
  const world = new World();
  res.send(world.name);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});
