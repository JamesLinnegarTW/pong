const ws = new WebSocket('ws://localhost:5000');
const text = document.getElementById("text");
ws.onopen = function open() {
  console.log('connected');
};

ws.onclose = function close() {
  text.innerText = 'disconnected';
};

ws.onmessage = function incoming(event) {
  text.innerText = event.data;
};


setInterval(()=> {
    ws.send(Date.now());
}, 1000);
