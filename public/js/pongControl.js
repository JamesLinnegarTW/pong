// Client

function startGame(name) { 
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
        
        socket.emit('moveUser', data);          

    }


    socket.on('connect', function () {
         
        socket.emit('user', {name:name}); 

        document.addEventListener('touchstart', function (e) {   
            e.preventDefault(); 
        }, false);

        document.addEventListener('touchmove', moveUser, false);


        socket.on('color', function (data) {
            $('html').css("backgroundColor", "rgb(" + data.r + "," + data.g + "," + data.b + ")" );
            paddle.show();
        });

        socket.on('disconnect', function(){
            alert('Game ended.');
            paddle.hide();
            document.removeEventListener('touchmove', moveUser, false);
            $('html').css("backgroundColor", "rgb(255,255,255)" );
        });
    });
        }


$(function(){
    $('button').click(function(){
        if($('#name').val()){
            startGame($('#name').val());
        }
    });
});