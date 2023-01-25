let container = $('container')
let canvas = $('canvas')
let c = canvas.getContext('2d')
let width = container.clientWidth
let height = container.clientHeight
let fps = 100

canvas.width = width
canvas.height = height

c.fillStyle = '#CCC'
c.strokeStyle = '#CCC'
c.font = 'bold 30px monospace';

let mouse = {
    x: width/2,
    y: height/2,
    z: false
}
window.addEventListener( 'mousemove', ( event)=>{
    mouse.x = event.x
    mouse.y = event.y
})
window.addEventListener( 'mousedown', ()=>{
    mouse.z = true
})
window.addEventListener( 'mouseup', ()=>{
    mouse.z = false
})
window.addEventListener( 'mouseleave', ()=>{
    mouse.z = false
}) 
window.addEventListener( 'keypress', (key)=>{
    if( key.key == 'r') location.reload()
})