const PORT = process.env.PORT || 5000

import World from './World';
import http from 'http';

http.createServer((req, res) => {
  const world = new World();
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end(world.name);
}).listen(PORT);

console.log('Server running');
