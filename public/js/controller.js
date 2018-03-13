(function() {
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

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var W = window.innerWidth, H = window.innerHeight;

canvas.width = W;
canvas.height = H;


window.onresize = function(){
W = window.innerWidth;
H = window.innerHeight;
canvas.width = W;
canvas.height = H;
};

window.bar = {
    color:"black",
    height: 20,
    top: (H / 2) - 10
  };

  window.bgColor = "#bada55";
  window.name = "-";


function resetCanvas(rCtx){
  rCtx.fillStyle = bgColor;
  rCtx.fillRect(0, 0, W, H);
}

function draw() {
  var tmpCanvas = document.createElement('canvas');
  tmpCanvas.width = W;
  tmpCanvas.height = H;


  var textCanvas = document.createElement('canvas');

  textCanvas.width = W;
  textCanvas.height = H;


  var textCtx = textCanvas.getContext("2d");
  var textSize = textCtx.measureText(name);

    textCtx.fillStyle = bgColor;
    textCtx.font="60px Arial";

    textCtx.textAlign = 'center';
        textCtx.textBaseline = 'middle';
    textCtx.fillText(name,  W/2, H/2);


  var tmpCtx = tmpCanvas.getContext("2d");

  resetCanvas(tmpCtx);

  tmpCtx.fillStyle = bar.color;
  tmpCtx.font="60px Arial";
  tmpCtx.textAlign = 'center';
  tmpCtx.textBaseline = 'middle';
  tmpCtx.fillText(name, W/2, H/2);

  tmpCtx.fillStyle = bar.color;
  tmpCtx.fillRect(0, bar.top, W, bar.height);

  tmpCtx.drawImage(textCanvas,0,bar.top,W,bar.height,0,bar.top,W,bar.height);
  ctx.drawImage(tmpCanvas, 0, 0);

  requestAnimationFrame(draw, canvas);

}

function startGame(name) {
  window.name = name;
  var socket = io.connect(
    'http://'+window.location.hostname+':9000/'
  );

  $('#form').hide();
  $('canvas').show();

  function moveUser(e) {

      e.preventDefault();

      var data = {};

      var y = e.touches[0].clientY ;
      data.y = (y/ window.innerHeight);
      window.bar.top = y;
      socket.emit('moveUser', data);

  }


  socket.on('connect', function () {

      socket.emit('user', {name:name});

      document.addEventListener('touchstart', function (e) {
          e.preventDefault();
      }, false);

      document.addEventListener('touchmove', moveUser, false);


      socket.on('color', function (data) {
          window.bgColor =  "rgb(" + data.r + "," + data.g + "," + data.b + ")";
      });

      socket.on('disconnect', function(){
          alert('Game ended.');
          document.removeEventListener('touchmove', moveUser, false);
          $('html').css("backgroundColor", "rgb(255,255,255)" );
      });
  });

  requestAnimationFrame(draw, canvas);

}

$(function(){
    $('button').click(function(){
        if($('#name').val()){
            startGame($('#name').val());
        }
    });
});
