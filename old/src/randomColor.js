
function randomColor(){
    return {
        r: Math.round((Math.random() * 255)),
        g: Math.round((Math.random() * 255)),
        b: Math.round((Math.random() * 255))
    }
}


module.exports = randomColor;
