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
    map_width: 2300,
    map_height: 1800,
    particle_count: 1200,
    universal_repulsion: .25,
    global_multiplier: .4,
    distance_multiplier: 1/130,
    max_velocity: 10,
    friction: .95
}

let camera = {
    x: - sim_settings.map_width / 2,
    y: - sim_settings.map_height / 2,
    z: .45,
    w: window.innerWidth,
    h: window.innerHeight
}

let mouse = {
    x: width/2,
    y: height/2,
    z: false,
    dx: 0,
    dy: 0,
}

window.addEventListener( 'mousemove', (event)=>{
    mouse.dx = (event.x - mouse.x) / camera.z
    mouse.dy = (event.y - mouse.y) / camera.z
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
    if( key.key == '+' || key.key == '=' ) camera.z *= 1.1
    if( key.key == '-') camera.z *= 0.9
})

class Grid{
    constructor(width, height, cell_size) {
        this.w = Math.ceil(width/cell_size)
        this.h = Math.ceil(height/cell_size)
        this.width = this.w * cell_size 
        this.height = this.h * cell_size
        this.cell_size = cell_size
        this.grid = new Array(this.h).fill(new Array(this.w).fill([]))
    }
    update(particles){
        this.grid = new Array(this.h).fill('').map( x => new Array(this.w).fill('').map(x => []))

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
                let color = `hsl( 0, 0%, ${this.grid[y][x].length*5}%)`
                render_rect(camera, x*this.cell_size, y*this.cell_size, this.cell_size, this.cell_size, color)
            }
        }
    }
}

let random_min = 0.6
let random_max = 2

types = {
    'red': {
        color: 'red',
        red: random(random_min, random_max),
        green: random(random_min, random_max),
        blue: random(random_min, random_max),
    },
    'green': {
        color: 'green',
        red: random(random_min, random_max),
        green: random(random_min, random_max),
        blue: random(random_min, random_max),
    },
    'blue': {
        color: 'blue',
        red: random(random_min, random_max),
        green: random(random_min, random_max),
        blue: random(random_min, random_max),
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
        render_circle(camera, this.x, this.y, 5, types[this.type].color)
    }
    update(grid){
        let found = grid.get_nearby(this.x, this.y, 2)
        for(let p of found){
            if(p == this) continue
            solver(this, p)
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
    let relation = types[p1.type][p2.type]
    let distance = Math.sqrt((p1.x-p2.x)**2 + (p1.y-p2.y)**2) * sim_settings.distance_multiplier
    let force = - sim_settings.global_multiplier * ( Math.exp(-distance) - Math.exp( sim_settings.universal_repulsion - distance * relation))
    if (force < -20) force = -20
    angle = Math.atan2(p1.x - p2.x, p1.y - p2.y)
    p1.vx += force * Math.sin(angle)
    p1.vy += force * Math.cos(angle)

}

function random_type(){
    return ['red', 'green', 'blue'][rdm(2)]
}
function random_particle(){
    return new Particle(rdm(sim_settings.map_width-1,1), rdm(sim_settings.map_height-1, 1), random_type())
}
let grid = new Grid(sim_settings.map_width, sim_settings.map_height, 80)
let particles = new Array(sim_settings.particle_count).fill('').map(x => random_particle())



