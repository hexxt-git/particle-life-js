let container = $('container')
let canvas = $('canvas')
let c = canvas.getContext('2d')
let width = container.clientWidth
let height = container.clientHeight
let fps = 50

canvas.width = width
canvas.height = height

c.fillStyle = '#CCC'
c.strokeStyle = '#CCC'
c.font = 'bold 30px monospace';

let sim_settings = {
    map_width: 3000,
    map_height: 2500,
    particle_count: 2000,
    numb_of_types: 7,
    universal_repulsion: .35,
    global_multiplier: .40,
    distance_multiplier: 1/70,
    max_velocity: 80,
    friction: .94,
    grid_cell_size: 150,
    grid_update_chance: 30,
    particle_update_chance: 30,
    render_grid: false
}

if(localStorage.getItem('sim_settings')){
    sim_settings = JSON.parse(localStorage.getItem('sim_settings'))
    $('particle-count-input').value = sim_settings.particle_count
    $('numb-of-types-input').value = sim_settings.numb_of_types
    $('universal-repulsion-input').value = sim_settings.universal_repulsion * 100 / 0.35
    $('distance-multiplier-input').value = sim_settings.distance_multiplier * 100 * 70
    $('friction-multiplier-input').value = sim_settings.friction * 100 / 0.94
    $('map-height-input').value = sim_settings.map_height
    $('map-width-input').value = sim_settings.map_width
}

$('submit').addEventListener('click', ()=>{
    sim_settings.particle_count = Math.abs(Math.floor($('particle-count-input').value))
    sim_settings.numb_of_types = Math.abs(Math.floor($('numb-of-types-input').value))
    sim_settings.universal_repulsion = Math.floor($('universal-repulsion-input').value) / 100 * 0.35
    sim_settings.distance_multiplier = Math.floor($('distance-multiplier-input').value ) / 100 / 70
    sim_settings.friction = Math.floor($('friction-multiplier-input').value) / 100 * 0.94
    sim_settings.map_height = Math.abs(Math.floor($('map-height-input').value))
    sim_settings.map_width = Math.abs(Math.floor($('map-width-input').value))
    localStorage.setItem('sim_settings', JSON.stringify(sim_settings))
    location.reload()
})
$('reset').addEventListener('click', ()=>{
    localStorage.removeItem('sim_settings')
    location.reload()
})

let camera = {
    x: - sim_settings.map_width / 2,
    y: - sim_settings.map_height / 2,
    z: .4,
    w: window.innerWidth,
    h: window.innerHeight
}

let mouse = {
    x: width/2,
    y: height/2,
    z: false,
    s: false,
    dx: 0,
    dy: 0,
    world_x: 0,
    world_y: 0,
}

window.addEventListener( 'mousemove', (event)=>{
    mouse.dx = (event.x - mouse.x) / camera.z
    mouse.dy = (event.y - mouse.y) / camera.z
    mouse.x = event.x
    mouse.y = event.y
})
$('container').addEventListener( 'mousedown', (e)=>{
    if(e.button == 0) mouse.z = true
    if(e.button == 1) mouse.s = true
})
$('container').addEventListener( 'mouseup', (e)=>{
    if(e.button == 0) mouse.z = false
    if(e.button == 1 || e.button == 2) mouse.s = false
})
$('container').addEventListener( 'mouseleave', (e)=>{
    if(e.button == 0) mouse.z = false
    if(e.button == 1 || e.button == 2) mouse.s = false
}) 
$('container').addEventListener( 'wheel', (event)=>{
    camera.z *= 1 - event.deltaY / 1000
})
window.addEventListener( 'keypress', (key)=>{
    if( key.key == 'r') location.reload()
    if( key.key == '+' || key.key == '=' ) camera.z *= 1.1
    if( key.key == '-') camera.z *= 0.9
    if( key.key == 'g') sim_settings.render_grid = ! sim_settings.render_grid
    if( key.key == ' ') push_particles(120)
    if( key.key == 'h'){
        if($('hud').style.display == 'none'){
            $('hud').style.display = 'block'
        } else {
            $('hud').style.display = 'none'
        }
    }
})

function push_particles(s){
    for(let i=0; i < particles.length; i++){
        let distance = Math.sqrt((particles[i].x - mouse.world_x)**2 + (particles[i].y - mouse.world_y)**2)
        let angle = Math.atan2(particles[i].x - mouse.world_x, particles[i].y - mouse.world_y)
        let force = Math.exp(-distance / 150) * s
        particles[i].vx += Math.sin(angle) * force
        particles[i].vy += Math.cos(angle) * force
    }
}

class Grid{
    constructor(width, height, cell_size) {
        this.w = Math.ceil(width/cell_size)
        this.h = Math.ceil(height/cell_size)
        this.width = this.w * cell_size 
        this.height = this.h * cell_size
        this.cell_size = cell_size
        this.grid = new Array(this.h).fill(new Array(this.w).fill([]))
    }
    grid_update(particles){
        this.grid = new Array(this.h).fill(0).map( x => new Array(this.w).fill(0).map(x => []))

        for(let p of particles){
            let x = Math.floor(p.x / this.cell_size)
            let y = Math.floor(p.y / this.cell_size)
            this.get_cell(x, y).push(p)
        }
    }
    get_nearby(x, y, r){
        let look_up_circle = getCircle(Math.round(x / this.cell_size), Math.round(y / this.cell_size), r)
        let found = []
        for(let i in look_up_circle){
            let x = look_up_circle[i].x
            let y = look_up_circle[i].y
            if(x < 0) x += this.w
            if(y < 0) y += this.h
            if(x >= this.w) x -= this.w
            if(y >= this.h) y -= this.h
            found.push(...this.get_cell(x, y))
        }
        return found
    }
    get_cell(x, y){
        if (y >= 0 && y < this.h && x >= 0 && x < this.w) return this.grid[y][x]
    }
    render(){
        for(let y in this.grid){
            for(let x in this.grid[y]){
                let color = `hsla( 230, 50%, 80%, ${this.grid[y][x].length*3}%)`
                render_rect(camera, x*this.cell_size, y*this.cell_size, this.cell_size, this.cell_size, color)
            }
        }
    }
}

class Particle{
    constructor(x, y, type) {
        this.x = x
        this.y = y
        this.type = type
        this.vx = 0
        this.vy = 0
    }
    render(){
        c.fillStyle = 'white'
        //render_circle(camera, this.x, this.y, 5, types[this.type].color)
        render_rect(camera, this.x, this.y, 10, 10, types[this.type].color)
    }
    particle_update(grid){
        if(random(0, 100) < sim_settings.particle_update_chance){
            let found = grid.get_nearby(this.x, this.y, 3)
            for(let p of found){
                if(p == this) continue
                solver(this, p)
            }
        }

        this.x += this.vx
        this.y += this.vy
        while(this.x < 0) this.x += grid.width
        while(this.y < 0) this.y += grid.height
        while(this.x >= grid.width) this.x -= grid.width
        while(this.y >= grid.height) this.y -= grid.height
        this.vx = clamp(this.vx, -sim_settings.max_velocity, sim_settings.max_velocity)
        this.vy = clamp(this.vy, -sim_settings.max_velocity, sim_settings.max_velocity)
        this.vx *= sim_settings.friction
        this.vy *= sim_settings.friction
    }
}

function solver(p1, p2){
    if(!types.hasOwnProperty(p1.type)) return 0
    if(!types[p1.type].hasOwnProperty(p2.type)) return 0
    let relation = types[p1.type][p2.type]
    let distance = Math.sqrt((p1.x-p2.x)**2 + (p1.y-p2.y)**2) * sim_settings.distance_multiplier
    let force = - sim_settings.global_multiplier * ( Math.exp(-distance) - Math.exp( sim_settings.universal_repulsion - distance * relation))
    force = clamp(force, -30, 30)
    angle = Math.atan2(p1.x - p2.x, p1.y - p2.y) 
    p1.vx += force * Math.sin(angle)
    p1.vy += force * Math.cos(angle)
}

let types = {}
for(let i = 0; i < sim_settings.numb_of_types; i++){
    types[rdm(1000000)] = {'color': randomColor()}
}

for(let type in types){
    for(let other in types){
        if(other == type){
            types[type][other] = random(.9, 2, false)
        } else {
            types[type][other] = random(0.2, 2, false)
        }
    }
}

function random_type(){
    return Object.keys(types)[rdm(Object.keys(types).length-1)]
}

function random_particle(){
    return new Particle(rdm(sim_settings.map_width-1,1), rdm(sim_settings.map_height-1, 1), random_type())
}

let grid = new Grid(sim_settings.map_width, sim_settings.map_height, sim_settings.grid_cell_size)
let particles = new Array(sim_settings.particle_count).fill(0).map(x => random_particle())
