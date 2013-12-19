// Client
$(function(){
    $("#color").spectrum({
        color: "#f00"
    });

    $("#color2").spectrum({
        color: "#f00"
    });

    var socket = io.connect(
        'http://'+window.location.hostname+':9000/'
    );

    socket.on('connect', function () {
        var x, y, direction = {x:0,y:0};
        var drawable = document.getElementById('draw');

        drawable.addEventListener('touchstart', function (e) {   
            e.preventDefault(); 
        }, false);

        drawable.addEventListener('touchmove', function (e) { 	

			e.preventDefault(); 

            var data = {f:[]};

            for(var i= 0; i< e.changedTouches.length; i++){
                var y = (e.touches[i].clientY / window.innerHeight);
                var x = (e.touches[i].clientX /  window.innerWidth);
                data.f.push({
                    'y': y.toFixed(2),
                    'x': x.toFixed(2),
                    'c':[ $("#color").spectrum("get").toRgb(),
                          $("#color2").spectrum("get").toRgb()
                        ]
                });
            }
            socket.emit('m', data);          

		}, false);


        drawable.addEventListener('touchend', function (e) {  
            var data = {f:[]};

            for(var i= 0; i< e.changedTouches.length; i++){
                data.f.push({
                    'y':(e.changedTouches[i].clientY / window.innerHeight).toFixed(2),
                    'x':(e.changedTouches[i].clientX / window.innerWidth).toFixed(2),
                    'c':[ $("#color").spectrum("get").toRgb(),
                               $("#color2").spectrum("get").toRgb()
                            ],
                    'bang': $('#bang').val()/10
                });
            }
            socket.emit('b', data);
        }, false);        
    

	});

});