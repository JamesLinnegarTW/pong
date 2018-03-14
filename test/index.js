import http from 'http';
import assert from 'assert';
const PORT = process.env.PORT || 5000

import '../lib/index.js';

describe('Example Node Server', () => {
  it('should return 200', done => {
    http.get('http://127.0.0.1:'+PORT, res => {
      assert.equal(200, res.statusCode);
      done();
    });
  });
});
