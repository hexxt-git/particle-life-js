function rdm (max){
    return Math.floor(Math.random()*(max +1));
};
function random ( min, max, floor){
    if (floor) return Math.floor((Math.random()*(max - min + 1)) + min);
    return (Math.random()*(max - min)) + min;
};
function rdmAround (x, floor){
    if (floor) return Math.floor( Math.random()* x * 2 - x )
    return Math.random()* x * 2 - x
}
function write (input){
    console.log('%c' +  JSON.stringify(input), 'color: #8BF');
    return void 0;
};
function error (input){
    console.log('%c' + JSON.stringify(input), 'color: #F54;');
    return void 0;
};
function $ (id){
    return document.getElementById(id);
};
function randomColor (){
    return `hsl( ${rdm(360)}, ${random( 40, 70, true)}%, ${random( 40, 80, true)}%)`
};
function getLine( x1, y1, x2, y2){
    let line = []
    if( x1 - x2 == 0 && y1 - y2 == 0) return line
    let dx = Math.abs(x1 - x2)
    let dy = Math.abs(y1 - y2)
    let m = dy / dx
    let steps = m > 1 ? dy : dx;
    let xincrement = dx / steps * (x1-x2 >= 0 ? -1 : 1)
    let yincrement = dy / steps * (y1-y2 >= 0 ? -1 : 1)
    for( let i = 0 ; i < steps+1 ; i++ ){
        line.push({x:Math.floor(x1+xincrement*i), y:Math.floor(y1+yincrement*i)})
    }
    return line
};
function getCircle( x, y, r){
    let circle = []
    for( let x1 = -r-1 ; x1 < r+1 ; x1++){
        for( let y1 = -r-1 ; y1 < r+1 ; y1++){
            if(Math.sqrt(Math.pow(x1,2)+Math.pow(y1,2))<=r) circle.push({x:x+x1, y:y+y1})
        }
    }
    return circle
};
function render_rect( camera, x, y, w, h, color){
    c.fillStyle = color
    c.fillRect(
        Math.round((x + camera.x) * camera.z + camera.w/2),
        Math.round((y + camera.y) * camera.z + camera.h/2),
        Math.round(w * camera.z)+1, Math.round(h * camera.z)+1
    )
}
function render_circle( camera, x, y, r, color){
    c.fillStyle = color
    c.beginPath()
    c.arc(
        Math.round((x + camera.x) * camera.z + camera.w/2),
        Math.round((y + camera.y) * camera.z + camera.h/2),
        Math.round(r * camera.z),
        0, 2*Math.PI
    )
    c.fill()
}
function clamp(x, min, max){
    return Math.max(Math.min(x, max), min)
}