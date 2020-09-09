let scene, ctx, gravity = .2, nextTime=0, fireWorks=[], particles=[];

let colors = ["#800000", "#008080", "#008000", "#008066", "#006680"];

class FireWorks extends Component {
    constructor(x, y, r) { 
        super({x, y, r});
        this.dest = new Vector(
            Math.randRange(r, scene.width - r),
            Math.randRange(r, scene.height / 2));
        this.color = Math.randFromArray(colors);
    }

    update() {
        if(Collision.pointAtSemiCircle(this.dest, this)) {
            Particle.create(this.x, this.y, this.color);
            fireWorks.splice(fireWorks.indexOf(this), 1);
        } else Motion.easeOut(this, this.dest, .03);

        fireWorks.forEach(f => {
            if(this !== f) {
                if(Collision.circle(this, f)) {
                    Collision.elastic(this, f);
                }
            }
        });

        particles.forEach(p => {
            if(Collision.circle(this, p)) 
                Collision.elastic(this, p);
        });
    }

    static create() {
        let n = Math.randRange(1, 3);
        for(let i=n; i > -1; i--) {
            let r = Math.randRange(2, 5);
            let x = Math.randRange(r, scene.width - r);
            let y = scene.height + r;
            let f = new FireWorks(x, y, r);
            f.vel = new Vector(Math.randRange(2, 3), Math.randRange(2, 3));
            fireWorks.push(f);
        }
    }
}


class Particle extends Component {
    constructor(x, y, a, c) {
        super({x, y, r:5});
        this.angle = a;
        this.c = c;
        this.s = Math.random() * 5;
        this.vel = {x:Math.randRange(-3, 3), y:0};
    }

    update() {
        
        if(this.y < scene.height - scene.height / 3) {
            Motion.addGravity(this, .2);
        }
        this.y += this.vel.y;
        this.x += this.vel.x;

        if(this.y > scene.height) 
            particles.splice(particles.indexOf(this), 1);

        particles.forEach(p => {
            if(this !== p) {
                if(Collision.circle(this, p)) 
                    Collision.elastic(this, p);
            }
        });
    }

    static create(x, y, c) {
        for(let i=0; i <= 360; i+=45) {
            particles.push(new Particle(x, y, Math.toRadian(i), c));
        }
    }
}


const update = () => {

    fireWorks.forEach(p => {
        p.update(); 
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
    });

    particles.forEach(p => {
        p.update(); 
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
    });

    ctx.fillStyle = "lightgray";
    ctx.font = "bold 18px Arial";
    ctx.fillText(`Fps: ${~~scene.fps}`, scene.width - 100, 30);

}


const animate = () => {
    ctx.clearColor(0, 0, scene.width, scene.height, "rgba(0, 0, 0, .07)");  
    update();
    if(scene.elapsedTime < nextTime) {
        scene.startLoop(scene.animationFrame);
        scene.calcFps();
        return;
    } else {
        nextTime = scene.elapsedTime + 1500;
        FireWorks.create();
        scene.startLoop(scene.animationFrame);
        scene.calcFps();
    }
    
}


const init = () => {

    scene = new Scene({
        canvas: document.getElementById("cvs"),
        width: innerWidth,
        height: innerHeight
    });

    ctx = scene.ctx;

    scene.mainLoop(animate);
}

addEventListener("load", init);
