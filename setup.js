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
    universal_repulsion: 1,
    global_multiplier: 6,
    distance_multiplier: 1/50,
    max_velocity: 100
}

let camera = {
    x: -width / 2,
    y: -height / 2,
    z: .6,
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
    mouse.dx = event.x - mouse.x
    mouse.dy = event.y - mouse.y
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

class Grid{
    constructor(width, height, cell_size) {
        this.width = Math.ceil(width/cell_size) * cell_size 
        this.height = Math.ceil(height/cell_size) * cell_size
        this.cell_size = cell_size
        this.grid = new Array(Math.ceil(this.height/this.cell_size)).fill(new Array(Math.ceil(this.width/this.cell_size)).fill([]))
    }
    update(particles){
        this.grid = new Array(Math.ceil(this.height/this.cell_size)).fill('').map( x => new Array(Math.ceil(this.width/this.cell_size)).fill('').map(x => []))

        for(let p of particles){
            let x = Math.floor(p.x / this.cell_size)
            let y = Math.floor(p.y / this.cell_size)
            this.grid[y][x].push(p)
        }
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
        let look_up_circle = getCircle(Math.round(this.x / grid.cell_size), Math.round(this.y / grid.cell_size), 2)
        for(let i in look_up_circle){
            let x = look_up_circle[i].x % (grid.width / grid.cell_size)
            let y = look_up_circle[i].y % (grid.height / grid.cell_size)
            x = Math.abs(x)
            y = Math.abs(y)
            for(let p of grid.grid[y][x]){
                if(p == this) continue
                solver(this, p)
            }
            this.vx *= .9
            this.vy *= .9
            if (this.vx > sim_settings.max_velocity) this.vx = sim_settings.max_velocity
            if (this.vx < -sim_settings.max_velocity) this.vx = -sim_settings.max_velocity
            if (this.vy > sim_settings.max_velocity) this.vy = sim_settings.max_velocity
            if (this.vy < -sim_settings.max_velocity) this.vy = -sim_settings.max_velocity
        }
        this.x += this.vx
        this.y += this.vy
        if(this.x < 0) this.x = grid.width - 1
        if(this.y < 0) this.y = grid.height - 1
        if(this.x >= grid.width) this.x = 1
        if(this.y >= grid.height) this.y = 1
    }
}
function random_type(){
    return ['red', 'green', 'blue'][rdm(2)]
}
function random_particle(){
    return new Particle(rdm(1499,1), rdm(799, 1), random_type())
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

let grid = new Grid(1700, 1200, 80)
let particles = new Array(1000).fill('').map(x => random_particle())



