const PORT = process.env.PORT || 5000
const HOST = '0.0.0.0';

import World from './world';
import http from 'http';

http.createServer((req, res) => {
  const world = new World();
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end(world.name);
}).listen(PORT, HOST);

console.log(`Server running on port ${PORT}`);
