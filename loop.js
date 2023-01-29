function loop(){

    //setTimeout(() => {
        requestAnimationFrame(loop)
    //}, 1000 / fps);
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
    if(random(0, 100) < sim_settings.grid_update_chance){
        grid.grid_update(particles)
    }
    if(sim_settings.render_grid){
        grid.render()
    }

    for(let i = 0; i < particles.length; i++){
        particles[i].render()
        particles[i].particle_update(grid)
    }
    
}

grid.grid_update(particles)
console.table(types)

loop()