var io = require('socket.io').listen(9000);
io.set('log level', 2);


// Import external files
var fs = require('fs');
var vm = require('vm');
var includeInThisContext = function(path) {
    var code = fs.readFileSync(path);
    vm.runInThisContext(code, path);
}.bind(this);

includeInThisContext('./public/js/underscore.js');


var clients = [];
var paddles = [];
var score = [0,0];

var static = require('node-static');
var file = new static.Server('./public');
var ball = {x: 0.5,y:0.0};
var speedY = 0.005;
var speedX = 0.005;

require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        file.serve(request, response);
    }).resume();
}).listen(8081);

function randomColor(){
    return {
        r: Math.round((Math.random() * 255)),
        g: Math.round((Math.random() * 255)),
        b: Math.round((Math.random() * 255))
    }
}

function noOfPlayers(){
    return Object.keys(paddles).length;
}

io.sockets.on('connection', function (socket) {
    console.log("hello");
    clients.push(socket);

    function reloadEverything(){
        var k = Object.keys(paddles);
        var temp = {};
        temp.p = [];
        for(var i = 0; i < k.length; i++){
            temp.p.push(paddles[k[i]]);
        }
        temp.score = score;
        for(var i= 0; i < clients.length; i++) {
            clients[i].emit('reload', temp); //reload everything?
        }

    }
    
    reloadEverything();

    socket.on('user', function(){
        console.log('new user');

        var color = randomColor();
        socket.emit('color',color);
        var newPaddle = {u: new Date(), y:0.5, side: (noOfPlayers() % 2), color:color};
        paddles[socket.id] = newPaddle;

        for(var i= 0; i < clients.length; i++) {
            clients[i].emit('newUser', paddles[socket.id]);
        }
    });

    socket.on('moveUser', function(data){
        var y = data.y;
        
        var paddle = paddles[socket.id];
        paddle.y = y;
        paddles[socket.id] = paddle;
        for(var i = 0; i < clients.length; i++) {
            clients[i].emit('moveUser', paddle);
        }
    });
    
    socket.on('disconnect', function(){
        console.log('byeeee');

        for(var i= 0; i < clients.length; i++) {
            if(clients[i].id == socket.id){
                clients.splice(i,1);
                break;                
            }
        }

        if(paddles[socket.id]) delete paddles[socket.id];
        
        reloadEverything();

    });


});

function collisionDetect(side){
   var keys = Object.keys(paddles);
   var paddle;
   

    if(side == 1 && noOfPlayers() == 1){
        return paddles[keys[0]].color;
    }

    for(var i = 0; i < keys.length; i++){
        paddle = paddles[keys[i]];

        if(ball.y >= (paddle.y - 0.1) &&
           ball.y <= (paddle.y + 0.1) &&
           paddle.side == side) {
           return paddle.color;
        }
    }
    return false;
}

function resetBall(){
    speedX = 0.005;

    ball.x = 0.5;
    ball.y = Math.random();
}

setInterval(function(){

    if(noOfPlayers() >= 1) {
        ball.x = ball.x + speedX;
        ball.y = ball.y + speedY;

        if(ball.y < 0) {
            speedY = -speedY;
        }

        if(ball.y > 1){
            speedY = -speedY;
        }

        if(ball.x <= 0){
            var collision = collisionDetect(0);

            if(collision){
                speedX = (-speedX) + 0.001;
                ball.x = 0.001;
  
                
                for(var i= 0; i < clients.length; i++) {
                    clients[i].emit('c', collision);
                }  
            } else {
                score[1]++;             
                for(var i= 0; i < clients.length; i++) {
                    clients[i].emit('b', {x:ball.x, y:ball.y, score:score});
                }

                resetBall();
            }
            
        }
        
        if(ball.x >= 1) {

            var collision = collisionDetect(1);

            if(collision){
                speedX = (-speedX) + 0.001;
                ball.x = 1 - 0.005;

                for(var i= 0; i < clients.length; i++) {
                    clients[i].emit('c', collision);
                }  
            } else {
                score[0]++;           
                for(var i= 0; i < clients.length; i++) {
                    clients[i].emit('b', {x:ball.x, y:ball.y, score : score});
                }
                speedX = -0.010;
                ball.x = 0.5;
                ball.y = Math.random();
            }

        }

        for(var i= 0; i < clients.length; i++) {
            clients[i].emit('ball', ball);
        }
    }
},10);
