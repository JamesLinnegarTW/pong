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

var balls = [];


require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        file.serve(request, response);
    }).resume();
}).listen(8081);


function Ball(){
    this.x = 0.5;
    this.y = 0.5;
    this.speedX = 0.005;
    this.speedY = 0;
    this.color = randomColor();
}

balls.push(new Ball());

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


io.sockets.on('connection', function (socket) {
    console.log("hello");
    clients.push(socket);

    
    reloadEverything();

    socket.on('user', function(){
        console.log('new user');

        var color = randomColor();
        socket.emit('color',color);
        var newPaddle = {u: new Date(), y:0.5, lastY:0.5, side: (noOfPlayers() % 2), color:color, lastMove: new Date()};
        paddles[socket.id] = newPaddle;

        for(var i= 0; i < clients.length; i++) {
            clients[i].emit('newUser', paddles[socket.id]);
        }
    });

    socket.on('newball', function(){
        if(balls.length < 5){
            balls.push(new Ball());
        }
    });

    socket.on('removeball', function(){
        if(balls.length > 1){
            balls.pop();
        }
    });

    socket.on('moveUser', function(data){
        var y = data.y, now = new Date();
        
        var paddle = paddles[socket.id];
        paddle.y = y;
        paddle.lastMove = now;
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

        removePaddle(socket.id);
    
    });


});

function removePaddle(id){
        console.log('removing paddle', id);
        if(paddles[id]) delete paddles[id]; 

        for(var i = 0; i < clients.length; i++){
            if (clients[i].id == id){
                try {
                    clients[i].disconnect();
                    clients.splice(i,1);
                    break;
                } catch(e){}
            }
        }

        reloadEverything();
}

function collisionDetect(side, ball){
   var keys = Object.keys(paddles);
   var paddle;
   var data = {};

    if(side == 1 && noOfPlayers() == 1){
        return paddles[keys[0]].color;
    }

    for(var i = 0; i < keys.length; i++){
        paddle = paddles[keys[i]];

        if(ball.y >= (paddle.y - 0.05) &&
           ball.y <= (paddle.y + 0.05) &&
           paddle.side == side) {

            data.speed = -(paddle.lastY - paddle.y) / 25;

           ball.color = paddle.color;
           return data;
        }

    }
    return false;
}


function resetBall(i){


    balls[i].x = 0.5;
    balls[i].y = 0.5;

    balls[i].speedX = Math.random() < 0.5 ? 0.005 : -0.005;

    balls[i].speedY = 0.0;
}

setInterval(function(){
   var keys = Object.keys(paddles);
   var paddle;
   var now = new Date();

    for(var i = 0; i < keys.length; i++){
        paddle = paddles[keys[i]];

        if((!paddle.lastMove) || ((paddle.lastMove.getTime() + 10000) < now.getTime())) {
            
            removePaddle(keys[i]);
        }
    }

},150000);

setInterval(function(){
    var keys = Object.keys(paddles);
    var paddle;

    for(var i = 0; i < keys.length; i++){
        paddle = paddles[keys[i]];
        paddle.lastY = paddle.y;
    }
}, 100);


setInterval(function(){


    if(noOfPlayers() > 1) {
        for(var b = 0; b < balls.length; b++){
            var ball = balls[b];
    
            ball.x = ball.x + ball.speedX;
            ball.y = ball.y + ball.speedY;            



            if(ball.y < 0) {
                ball.speedY = -ball.speedY;
            }

            if(ball.y > 1){
                ball.speedY = -ball.speedY;
            }

            if(ball.x <= 0){
                var collision = collisionDetect(0, ball);

                if(collision){
                    ball.speedX = -(ball.speedX - 0.001);
                    ball.x = 0.001;
                    ball.speedY = ball.speedY + collision.speed;      
                } else {
                    score[1]++;             
                    for(var i= 0; i < clients.length; i++) {
                        clients[i].emit('b', {x:ball.x, y:ball.y, score:score, color: ball.color});
                    }

                    resetBall(b);
                }
                
            }
            
            if(ball.x >= 1) {

                var collision = collisionDetect(1, ball);

                if(collision){
                    ball.speedX = -(ball.speedX + 0.001);
                    ball.x = 1 - 0.005;
                    ball.speedY = ball.speedY + collision.speed;      

                } else {
                    score[0]++;           
                    for(var i= 0; i < clients.length; i++) {
                        clients[i].emit('b', {x:ball.x, y:ball.y, score : score, color: ball.color});
                    }
                    resetBall(b);
                }

            }

            for(var i= 0; i < clients.length; i++) {
                clients[i].emit('ball', balls);
            }

            if(score[0] >= 7 || score[1] >= 7){
                var winner = (score[0] > score[1])?0:1;
                for(var i= 0; i < clients.length; i++) {
                    clients[i].emit('win', {score:[0,0],winner:winner});
                }   
                score = [0,0];

            }
        }
    } else {
        score = [0,0];
    }

},10);
