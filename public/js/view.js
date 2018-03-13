(function() {
  var GRAVITY = -2;
    var lastTime = 0;


    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());


(function(){
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");
  //var imageObj = new Image();
  var lastRender = new Date();
  var serverTime = "";
    var paddles = [];
    var score = [0,0];
    var worldBuffer = [];
    var worldBufferIndex = -1;
    var W = window.innerWidth, H = window.innerHeight;


  //  imageObj.src = './img/ThoughtWorks-logo.png';


  canvas.width = W;
  canvas.height = H;


     window.onresize = function(){
             W = window.innerWidth;
             H = window.innerHeight;
         canvas.width = W;
             canvas.height = H;

     };

  var fireworks = [];
  var trails = [];
  var particle_count = W  * 0.25;


  function Firework(x, y, bang, color ){
    var particles = [];

    var particleSize = Math.round(Math.random()*15) + 5;

    var direction = (Math.random() / 2);
    this.color = color;

    if(Math.floor((Math.random()*2)-1) == 0){
      direction = -direction;
    }

    for(var i = particles.length; i < Math.random() * particle_count + 50; i++) {
      particles.push(new Particle(x, y, color, particleSize, bang, direction, this.color));
    }

    this.draw = function(ctx){
      for(var i = 0; i < particles.length; i++){
        if(!particles[i].draw(ctx)){
          particles.splice(i,1);
          i--;
        }
      }
      return (particles.length > 0);
    };
  };


  function Trail(x, y, color){
    var bang = 5;
    var particles = [];
    this.color = color;

    var particleSize = (H * 0.001)  * (Math.random() * 5);

    var direction = (Math.random() / 2);

    for(var i = 0; i < Math.round(Math.random()*10);i++){
      particles.push(new Particle(x, y, color, particleSize, bang, direction, this.color));
    }

    this.draw = function(ctx){
      for(var i = 0; i < particles.length; i++){
        if(!particles[i].draw(ctx)){
          particles.splice(i,1);
          i--;
        }
      }
      return (particles.length > 0);
    };
  };


  function Paddle(y, side, color, name){

    this.y = y;
    this.side = side;
    this.color = color;

    this.setY = function(y){
      this.y = y;
    }

    this.draw = function(ctx){

      ctx.font = "bold 12px sans-serif";
      var nameWidth = ctx.measureText(name);
      //console.log(nameWidth);
      if(this.color){
        ctx.fillStyle = "rgb("+this.color.r+","+this.color.g+","+this.color.b+")";
      } else {
        ctx.fillStyle = "red";
      }
      if(this.side == 0){
        ctx.fillRect(0,    (H * this.y) - ((H * 0.1)/2), 10, H * 0.1);
        ctx.fillText(name, 20, (H * this.y));
      } else {
        ctx.fillRect(W-10, (H * this.y) - ((H * 0.1)/2), 10, H * 0.1);
        ctx.fillText(name, W - (nameWidth.width + 20), (H * this.y));

      }
    }
  }

  function Particle(x, y, color, particleSize, bang, direction, color)
  {
    var distance = (Math.random() * bang);
    var startTime = new Date();
    var speed = {x: (-distance+Math.random()*(2 * distance)),
           y: (-distance+Math.random()*(2 * distance) - (distance/2)) };

    var location = {x: x, y: y};

    var radius = 10+Math.random()*(particleSize);

    var life = 100+Math.random()*10;
    var remaining_life = life;

    this.r = color.r;
    this.g = color.g;
    this.b = color.b;

    this.draw = function(ctx){
      var delta = (new Date() - (startTime || new Date())) / 50;

      ctx.beginPath();
      opacity = Math.round(remaining_life/life*100)/100

      var gradient = ctx.createRadialGradient(location.x, location.y, 0, location.x, location.y, radius);
      gradient.addColorStop(0, "rgba("+this.r+", "+this.g+", "+this.b+", "+opacity+")");
      gradient.addColorStop(0.5, "rgba("+this.r+", "+this.g+", "+this.b+", "+opacity+")");
      gradient.addColorStop(1, "rgba("+this.r+", "+this.g+", "+this.b+", 0)");

      ctx.fillStyle = gradient;
      ctx.arc(location.x, location.y, radius, Math.PI*2, false);
      ctx.fill();

      remaining_life = remaining_life - (1 * delta);
      radius = radius - (1 * delta);

      location.x += (speed.x * delta);
      location.y += (speed.y * delta);

      if(location.y > H){
        location.y = H;
        speed.y = -(speed.y *0.6);
      }
      if(location.x > W){
        location.x = W;
        speed.x = -(speed.x *0.6);
      }
      if(location.y < 0){
        location.y = 0;
        speed.y = -(speed.y *0.6);
      }
      if(location.x < 0){
        location.x = 0;
        speed.x = -(speed.x *0.6);
      }

      speed.y = speed.y + (0.6 * delta);
      speed.x = speed.x + (direction * delta);
      startTime = new Date();
      if((remaining_life < 0 || radius < 0) ) {
        return false; //kill the particle
      } else {
        return true;
      }
    };
  }

  function resetCanvas(rCtx){
    rCtx.fillStyle = "black";
    rCtx.fillRect(0, 0, W, H);
  }

  function draw() {
    var tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = W;
    tmpCanvas.height = H;
    var tmpCtx = tmpCanvas.getContext("2d");

    resetCanvas(tmpCtx);

  //	tmpCtx.globalCompositeOperation="source-over";
  //    tmpCtx.drawImage(imageObj, (W/2) - (260/2), (H/2) - (157 / 2));

    tmpCtx.globalCompositeOperation = "lighter";

      if(trails.length > 0){

        for(var i = 0; i < trails.length; i++)
        {

          var f = trails[i];
          if(!f.draw(tmpCtx)){
            trails.splice(i,1);
            i--;
          }
        }
      }

      if(fireworks.length > 0){

        for(var i = 0; i < fireworks.length; i++)
        {

          var f = fireworks[i];
          if(!f.draw(tmpCtx)){
            fireworks.splice(i,1);
            i--;
          }
        }
      }


      if(paddles.length > 0){
        for(var i = 0; i < paddles.length; i++){
          paddles[i].draw(tmpCtx);
        }
      }


      tmpCtx.fillStyle = "white";
    tmpCtx.font="20px Arial";
    tmpCtx.textAlign = 'center'
    tmpCtx.fillText(score[0] + ' : ' + score[1],(W/2), (H/2) + 130);

    ctx.drawImage(tmpCanvas, 0, 0);
    lastRender = new Date();

    requestAnimationFrame(draw, canvas);

  }


  requestAnimationFrame(draw, canvas);


  var socket = io.connect(
    'http://'+window.location.hostname+':9000/'
  );

  socket.on('connect', function () {
      socket.emit('v', {});
  });

  socket.on('b', function(data) {
    var bang = (2 * (W * 0.02)) + 5;

    score = data.score;
    fireworks.push(new Firework((data.x * W), (data.y * H), bang,  data.color ));
  });



  socket.on('w', function(data){
    serverTime = data.time;
    worldBufferIndex++;
    if(worldBufferIndex > 1000){
      worldBufferIndex = 0;
    }
    worldBuffer[worldBufferIndex] = data;
    paddles = [];
    for(var i =0; i < data.balls.length; i++){
      trails.push(new Trail((data.balls[i].x * W), (data.balls[i].y * H), data.balls[i].color ));
    }
    for(var i =0; i < data.paddles.length; i++){
      paddles.push(new Paddle(data.paddles[i].y, data.paddles[i].side, data.paddles[i].color, data.paddles[i].name));
    }
  });


  socket.on('win', function(data){

    for(var i = 0; i < 10; i++){
      fireworks.push(new Firework((Math.random() * W), (Math.random() * H), (2 * (W * 0.02)) + 5,  randomColor() ));
    }

    score = data.score;
  });


  function randomColor(){
      return {
          r: Math.round((Math.random() * 255)),
          g: Math.round((Math.random() * 255)),
          b: Math.round((Math.random() * 255))
      }
  }
})();
