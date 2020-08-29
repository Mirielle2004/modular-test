
/**
 * @description Pricipal class that manipulates the canvas element and draws the canvas
 */
class Scene {
    /**
     * 
     * @param {Object} arg objects arguement for the scene, it accepts 
     * keyword arguements: width, height, backgroundColor, update and debug.
     * 
     */
    constructor(arg) {
        this.canvas = arg.canvas || null;
        try {
            this.ctx = this.canvas.getContext("2d");
        } catch(error) {
            throw new Error("Failed to initialize canvas");
        }
        this.width = arg.width || 300;
        this.height = arg.height || 300;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.controls = arg.controls || [];
        this.update = arg.update || null;
        // if debug, you'll be getting console messages to keep track on the program
        this.debug = (arg.debug === undefined) ? false : arg.debug;
        
        this.currentTime = 0;
        this.animationFrame = null;

        // set default controls
        this.joystick = null;
        this.swipe = null;
        this.controls.forEach((c, i) => {
            if(c.event === "swipe") {
                this.swipe = new SwipeControl(this.canvas, {debug: 
                    this.debug, type:c.type});
            } else if(c.event === "joystick") {
                this.joystick = new Joystick(this.canvas, c.style);
            }
        });

        // set default backgroundColor
        if(arg.backgroundColor !== "undefined")
            this.canvas.style.backgroundColor = arg.backgroundColor;
        this.checkDebug(console.log, "Scene created succesfully");
    }

    // 
    mainLoop(callback) {
        this.checkDebug(console.log, "mainLoop's started");
        const animate = currentTime => {
            this.currentTime = currentTime;
            this.animationFrame = animate;
            callback();
           
        }
        requestAnimationFrame(animate);
    }
}


Object.assign(Scene.prototype, AbstractBaseMixin);
