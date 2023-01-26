function loop(){

    setTimeout(() => {
        requestAnimationFrame(loop)
    }, 1000 / fps);
    width = container.clientWidth
    height = container.clientHeight
    if( canvas.width != width ) canvas.width = width 
    if( canvas.height != height ) canvas.height = height
    c.clearRect(0, 0, width, height)

    camera.w = width
    camera.h = height
    if(mouse.z){
        camera.x += mouse.dx
        camera.y += mouse.dy
        mouse.dx = 0
        mouse.dy = 0
    }
    grid.update(particles)
    //grid.render()

    particles.forEach(p => {
        p.render()
        p.update(grid)
        }
    )
    
}

loop()