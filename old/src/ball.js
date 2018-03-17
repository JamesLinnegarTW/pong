var randomColor = require('./randomColor');
function Ball(){
    this.x = 0.5;
    this.y = 0.5;
    this.speedX = 0.005;
    this.speedY = 0;
    this.color = randomColor();
}

module.exports = Ball;
