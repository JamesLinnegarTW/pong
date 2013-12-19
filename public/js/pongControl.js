// Client

$(function(){
        var paddle = $('#paddle');



        function moveUser(e) {  

            e.preventDefault(); 

            var data = {};

            var y = (e.touches[0].clientY / window.innerHeight);
            data.y = y;
            $('#paddle').css('top', (y * 100) + '%');
            socket.emit('moveUser', data);          

        }

        var socket = io.connect(
            'http://'+window.location.hostname+':9000/'
        );

        socket.on('connect', function () {
             
            socket.emit('user', {}); 

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

});