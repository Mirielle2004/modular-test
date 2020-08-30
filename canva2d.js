const AbstractBaseMixin = {

    debug: false,

    checkDebug(callback, message) {
        if(this.debug) callback(message);
    }

};

CanvasRenderingContext2D.prototype.__proto__ = {

    /**
     * @description suitable for clearing screen in during animation
     * @param {number} x starting point of the rectangle
     * @param {number} y starting point of the rectangle on the Y-axis
     * @param {number} w width of the rectangle
     * @param {number} h height of the rectangle
     * @param {string} color color of the rectangle
     */
    clearColor(x, y, w, h, color) {
        this.fillStyle = color;
        if(color !== undefined)
            this.fillRect(x, y, w, h);
        else this.clearRect(x, y, w, h);
    },

    /**
     * 
     * @description Draws a customizable arc 
     * @param {number} x centre point on the X-axis
     * @param {number} y centre point on the Y-axis
     * @param {number} radius radius of the circle
     * @param {string} fill fillStyle for the circle
     * @param {string} stroke strokeStyle for the circle
     * @param {number} width thickness only if strokeStyle is being used
     * 
     */

    Joystick2dArc(x, y, radius, fill, stroke, width=0) {
        this.save();
        this.lineWidth = width;
        this.strokeStyle = stroke || fill;
        this.fillStyle = fill;
        this.beginPath();
        this.arc(x, y, radius, 0, 2 * Math.PI);
        this.closePath();
        if(!(stroke === "none" || stroke === "")) this.stroke();
        if(!(fill === undefined || fill === "none" || fill === "")) this.fill();
        this.restore();
    }

};

/**
 * @description Vector 
 * 
 * diff(n) = n2 - (n1 || 0)
 * 
 * @param {number} x diff(X) of the vector
 * @param {number} y diff(Y) of the vector
 * 
 */
const Vector = function (x, y) {
    this.x = x;
    this.y = y;
    this.magnitude = Math.hypot(this.x, this.y);
    this.angle = Math.atan2(this.y, this.x);
}


Vector.prototype = {

    // normalised the vector
    normalise() {
        let magnitude = this.magnitude();
        this.x /= magnitude;
        this.y /= magnitude;
    },

    rotate(angle) {
        let x = this.x * Math.cos(angle) - this.y * Math.sin(angle);
        let y = this.y * Math.sin(angle) + this.y * Math.cos(angle);
        return new Vector(x, y);
    },

    /**
     * @description vector's addition
     * @param {number} vec The second vector to be added with this
     * @returns {Vector}
     */
    add(vec) {
        let x = this.x + vec.x;
        let y = this.y + vec.y;
        return new Vector(x, y);
    },

    /**
     * @description vector's subtraction
     * @param {number} vec The second vector to be subtracted from this
     * @returns {Vector}
     */
    subtract(vec) {
        let x = this.x - vec.x;
        let y = this.y - vec.y;
        return new Vector(x, y);
    },

    /**
     * @description vector - scalar multiplication
     * @param {number} scalar The scaling value
     * @returns {Vector}
     */
    multiply(vec) {
        let x = this.x * vec.x;
        let y = this.y * vec.y;
        return new Vector(x, y);
    },

    /**
     * @description vector's dot product : shows how much of this is being projected to the other vector
     * @param {number} vec The other vector to compared with
     * @returns {number}
     */
    dot(vec) {
        let x = this.x * vec.x;
        let y = this.y * vec.y;
        return x + y;
    }
    
}

/**
 * @description 2D camera class mostly useful in tile-based game development
 */
class Camera extends Vector {
    constructor(x, y, w, h) {
        super(x, y);
        this.w = w;
        this.h = h;

        // follow up camera mostly in a tiled base game's maximum and minimum location
        this.maxDimension = new Vector();
    }

    follow(component) { 
       // get the camera position from the centre of the player
        let cameraPos = new Vector(component.getCenterX(),
                component.getCenterY()).subtract({
                x: this.w * .5, y: this.h * .5});
                    
        // set camera to the center of the player
        this.x = cameraPos.x;
        this.y = cameraPos.y;

        // stop moving the camera if it is less than 0 or greater than the mapSize on the X-axis
        this.x = Math.min(Math.max(0, this.x), Math.min(
            this.maxDimension.x - this.w, Math.max(0, cameraPos.x)));

        // stop moving the camera if it is less than 0 or greater than the mapSize on the Y-axis
        this.y = Math.min(Math.max(0, this.y), Math.min(
            this.maxDimension.y - this.h, Math.max(0, cameraPos.y))); 
    }
}

/**
 * @description constructs tileMap on the canvas
 * 
 * A tilemap constructor accepts keyword arguments, including
 * map: the actual map to be drawn
 * w:       The width of the map
 * h:       The height of the map
 * tile:    tile info for the map
 * camera:  camera to the map
 * id:      current map value on iteration
 * row:     current row value on iteration
 * col:     current column value on iteration
 * path:    walkable tiles on the map
 * currentTile: current tile of the player on the map
 * debug:    says when in debugging mode or not
 */
class TileMap {
    /**
     * @constructor
     * @param {object} arg keyword arguments for the tileMap
     * 
     */
    constructor(arg) {
        this.map = arg.map || null;

        if(this.map === null || typeof this.map !== "object") {
            throw new Error("TileMap constructor must have an error free 2D array has value to the map keyword arguement");
        }
        // topology
        this.w = arg.tileW;
        this.h = arg.tileH;
        this.tileW = this.w;
        this.tileH = this.h;

        this.camera = arg.camera  || new Camera(0, 0, 0, 0);
        this.id = null;
        this.row = null;
        this.col = null;
        this.debug = arg.debug || false;

        // set camera's entity
        this.mapSize = new Vector(this.map[0].length, this.map.length);      // length of the map in a M x N represented as a vector
        this.mapDimension = new Vector(this.w, this.h).multiply(this.mapSize);    // size of the map as width and height represented as a vector
        this.camera.maxDimension = this.mapDimension;
    }

    /**
     * @description render tileMap to the canvas on a GO
     * @param {function} callback A function to describing how the tile should be drawn
     * you can access the mapId, current row and col to render each tile inside this 
     * function
     * 
     */
    createMap(callback) {

        // clamp the tile view
        let x_min = ~~(this.camera.x / this.w);
        let y_min = ~~(this.camera.y / this.h);

        let x_max = Math.ceil((this.camera.x + this.camera.w) / this.w);
        let y_max = Math.ceil((this.camera.y + this.camera.h) / this.h);

        x_min = Math.min(Math.max(0, x_min), Math.min(this.mapSize.x, Math.max(0, x_max)));
        y_min = Math.min(Math.max(0, y_min), Math.min(this.mapSize.y, Math.max(0, y_max)));

        for(let r = y_min; r < y_max; r++) {
            for(let c = x_min; c < x_max; c++) {
                this.id = this.map[r][c];
                this.row = r;
                this.col = c;
                callback();
            }
        }

    }

    /**
     * @description
     * @param {number} x pos of the Object in X-axis
     * @param {number} y pos of the Object in Y-axis
     * @returns the value corresponding to x and y on the map
     */
    tileAt(x, y) {
        let pos = new Vector(~~(x / this.w), ~~(y / this.h));
        return this.map[pos.y][pos.x];
    }

    valueAt(row, col) {
        return row * this.col + col;
    }

}



Object.assign(TileMap.prototype, AbstractBaseMixin);

class TileSet {
    constructor(arg) {
        this.img = new Image();
        this.img.src = arg.img;
        this.w = arg.w;
        this.h = arg.h;
        this.col = arg.col;
        this.row = arg.row;
    }

    tileAt(pos) {
        return new Vector(pos.x / this.w, pos.y / this.h);
    }

    indexAt(value) {
        let x = ~~(value % this.col);
        let y = ~~(value / this.col);
        return new Vector(x, y);
    }

    valueAt(row, col) {
        return row * this.col + col;
    }
}

class Component extends Vector {
    constructor(x = 0, y = 0, w = 0, h = 0) {
        super(x, y);
        this.w = w;
        this.h = h;
        this.vel = new Vector(2, 2);

        // JUMP 
        this.isJumping = false;
        this.jumpCounter = 0;
    }

    getCenterX() {
        return this.x + this.w * .5;
    }

    getCenterY() {
        return this.y + this.h * .5;
    }
}


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

/**
 * 
 * @description gives a swipe gesture functionality to it's binded element
 * 
 */
class SwipeControl {
    /**
     * 
     * @constructor
     * @param {Object} element elements to add the listener to
     * 
     */
    constructor(element, arg={debug:false, type:"default"}) {
        this.element = element;             
        this.direction = null;              // direction of the swipe
        this.isActive = false;              // flag if swipe is active
        this.pos = new Vector(0, 0);        // position of the cursor on start
        this.debug = arg.debug;

        if(arg.type !== undefined) {
            switch(arg.type.toLowerCase()) {

                case "touch":
                    this.touch();
                    break;
    
                case "mouse":
                    this.mouse();
                    break;
    
                case "default":
                    this.mouse();
                    this.touch();
                    break;
                default:
                    console.error(`${arg.type} types does not exists`);
            };
        } else {
            this.mouse();
            this.touch();
        }

        this.checkDebug(console.log, "Swipe controls initialized successfully");
        
    }

    /**
     * 
     * @description check for swipes
     * @param {vector} startPoint starting vector when element is focused
     * @param {vector} endPoint current point during swipe
     * 
     */
    checkSwipe(startPoint, endPoint) {
        let newPos = endPoint.subtract(startPoint);
        if(Math.abs(newPos.x) > Math.abs(newPos.y)) {
            if(newPos.x < 0) 
                this.direction = "left";
            else this.direction = "right";
        } else {
            if(newPos.y < 0)
                this.direction = "top";
            else this.direction = "down";
        }
    }

    /**
     * @description checks for touch swipe
     */
    touch() {
        this.element.addEventListener("touchstart", e => {
            this.isActive = true;
            this.pos = new Vector(e.touches[0].pageX, e.touches[0].pageY);
            this.checkDebug(console.log, `Swipe Starts...`);
        });

        this.element.addEventListener("touchmove", e => {
            this.isActive = true;
            this.checkSwipe(this.pos, new Vector(e.touches[0].pageX, e.touches[0].pageY));
            this.element.dispatchEvent(new CustomEvent("swipe", {
                detail: {
                    e: e,
                    isActive: this.isActive,
                    originX: this.pos.x,
                    originY: this.pos.y,
                    clientX: e.touches[0].pageX,
                    clientY: e.touches[0].pageY,
                    direction: this.direction
                }
            }));
            this.checkDebug(console.log, `${this.direction.toUpperCase()} Swipe`);
            e.preventDefault();
        });

        this.element.addEventListener("touchend", () => {
            this.isActive = false;
            this.pos = new Vector(0, 0);
            this.checkDebug(console.log, `Swipe ends...`);
        });
    }

    /**
     * @description handles mouse swipe
     */
    mouse() {
        this.element.addEventListener("mousedown", e => {
            this.isActive = true;
            this.pos = new Vector(e.clientX, e.clientY);
            this.checkDebug(console.log, `Swipe Starts.....`);
        });

        this.element.addEventListener("mousemove", e => {
            if(this.isActive) {
                this.checkSwipe(this.pos, new Vector(e.clientX, e.clientY));
                    this.element.dispatchEvent(new CustomEvent("swipe", {
                    detail: {
                        e: e,
                        isActive: this.isActive,
                        originX: this.pos.x,
                        originY: this.pos.y,
                        clientX: e.clientX,
                        clientY: e.clientY,
                        direction: this.direction
                    }
                }));

                this.checkDebug(console.log, `${this.direction.toUpperCase()} Swipe`);
            }
        });

        this.element.addEventListener("mouseup", () => {
            this.isActive = false;
            this.pos = new Vector(0, 0);
            this.checkDebug(console.log, `Swipe Ends...`);
        });
    }
     
}



Object.assign(SwipeControl.prototype, AbstractBaseMixin);

/**
 * @description principal object that initializes and draw a joystick
 * 
 * It accepts a canvas element as it's first arguement then some keywords argument which are
 * {
 *      dynamic: joystick can appear anywhere in the world if true
 *      debug:   Keep track of the joystick's processes through messages in the console
 *      origin:  Vector containing information about the location of the joystick
 *      pos:     dynamic vector containing location's info of the movable joystick circle
 *      direction: direction of the joystick
 *      
 *      styles to the movable joystick circle:
 *          color
 *          lineWidth
 *          outlineColor
 *          innerRadius
 * 
 *      styles to the static joystick circle:
 *          backgroundColor
 *          backgroundLineWidth
 *          backgroundOutlineColor
 *          outterRadius
 *      
 *      isActive: says if the joystick is active
 *      isDisplay: says if the joystick is display
 *      isFading: says if the joystick is Fading
 * 
 *      timeSpan: accepts it value as arg.fadeIn and determine how long a joystick should stay before fading in
 * }
 */

class Joystick {
    /**
     * 
     * @constructor
     * @param {object} arg an object that accepts a predefined keys and map
     * their values to the respected component of the joystick
     * 
     */
    constructor(canvas, arg) {
        this.canvas = canvas;
        try {
            this.ctx = this.canvas.getContext("2d");
        } catch (error) {
            throw new Error("Joystick Failed to intialize CANVAS");
        }
        this.dynamic = (arg.dynamic === false) ? false:true;
        this.debug = arg.debug || false;
        this.origin = new Vector(arg.x || 0, arg.y || 0);
        this.pos = new Vector(arg.x || 0, arg.y || 0);
        this.direction = null;

        // styling
        this.color = arg.color || "lightgray";
        this.lineWidth = arg.lineWidth || 4;
        this.outlineColor = arg.outlineColor || "#222";
        this.innerRadius = arg.innerRadius || 15;
        this.backgroundColor = arg.backgroundColor || "none";
        this.backgroundOutlineColor = arg.backgroundOutlineColor || "#222";
        this.backgroundLineWidth = arg.backgroundLineWidth || 4;
        this.outerRadius = arg.outerRadius || 50;
        
        this.isActive = false;
        // animation
        this.timeSpan = arg.fadeIn || 100;  
        this.timeSpanCounter = this.timeSpan;
        this.speedCounter = 0;
        this.isDisplay = false;
        this.isFading = false;
        this.alpha = 1;

        if(arg.type !== undefined) {
            switch(arg.type.toLowerCase()) {

                case "touch":
                    this.touch();
                    break;
    
                case "mouse":
                    this.mouse();
                    break;
    
                case "default":
                    this.mouse();
                    this.touch();
                    break;
                default:
                    console.error(`${arg.type} types does not exists`);
            };
        } else {
            this.mouse();
            this.touch();
        }

        this.checkDebug(console.log, "Joystick Initialized successfully");
    }

    /**
     * @description draw joystick on the canvas
     */
    draw() {
        this.ctx.save();
        this.ctx.globalAlpha = this.alpha;
        this.ctx.Joystick2dArc( this.origin.x, this.origin.y, this.outerRadius, 
            this.backgroundColor, this.backgroundOutlineColor, this.backgroundLineWidth);
        this.ctx.Joystick2dArc( this.pos.x, this.pos.y, this.innerRadius, 
            this.color, this.outlineColor, this.lineWidth);
        this.ctx.restore();
    }

    /**
     * @description fade in the joystick when not active
     */
    fadeIn() {
        if(this.isFading) {
            this.timeSpanCounter-=1;
            this.alpha = Math.abs(this.timeSpanCounter / this.timeSpan);
            if(this.alpha <= 0) {
                this.isDisplay = false;
                this.timeSpanCounter = this.timeSpan;
            }
        }
    }

    checkSwipe(startPoint, endPoint) {
        let newPos = endPoint.subtract(startPoint);
        if(Math.abs(newPos.x) > Math.abs(newPos.y)) {
            if(newPos.x < 0) 
                this.direction = "left";
            else this.direction = "right";
        } else {
            if(newPos.y < 0)
                this.direction = "top";
            else this.direction = "down";
        }
    }

    /**
     * Listen to joystic events with mouse
     */
    mouse() {
        this.canvas.addEventListener("mousedown", e => {
            if(this.dynamic) {
                let cssPos = this.canvas.getBoundingClientRect();
                this.origin = new Vector(e.clientX, e.clientY)
                    .subtract({x: cssPos.x, y: cssPos.y});
                this.pos = new Vector(e.clientX, e.clientY)
                    .subtract({x: cssPos.x, y: cssPos.y});;
                this.isDisplay = true;           
                this.isFading = false;
                this.alpha = 1;
            }
            this.isActive = true;
            this.checkDebug(console.log, `Joystick Starting...`);
        });

        this.canvas.addEventListener("mousemove", e => {
            if(this.isActive) {
                let cssPos = this.canvas.getBoundingClientRect();
                let newPos = new Vector(e.clientX, e.clientY)
                    .subtract({x: cssPos.x, y: cssPos.y})
                    .subtract(this.origin);
                this.checkSwipe(this.origin, new Vector(e.clientX, e.clientY));
                let radius = Math.min(newPos.magnitude, this.outerRadius);
                this.pos.x = this.origin.x + Math.cos(newPos.angle) * radius;
                this.pos.y = this.origin.y + Math.sin(newPos.angle) * radius;

                this.canvas.dispatchEvent(new CustomEvent("joystick", {
                    detail: {
                        e: e,
                        angle: newPos.angle,
                        magnitude: newPos.magnitude,
                        direction: this.direction,
                        origin: this.origin,
                        client: new Vector(e.clientX, e.clientY),
                        pos: this.pos,
                        isActive: this.isActive,
                    }
                }));

                this.checkDebug(console.log, `${~~(newPos.angle * 180 / Math.PI)} angle`);
            }
        });

        this.canvas.addEventListener("mouseup", () => {
            if(this.dynamic) {
                this.isActive = false;
                this.isFading = true;
            } else {
                this.pos = new Vector(this.origin.x, this.origin.y);
            }
            this.direction = null;
            this.checkDebug(console.log, `Joystick waiting...`);
        });
    }

    /**
     * Listen to joystic events on touch
     */
    touch() {
        this.canvas.addEventListener("touchstart", e => {
            if(this.dynamic) {
                let cssPos = this.canvas.getBoundingClientRect();
                this.origin = new Vector(e.touches[0].pageX, e.touches[0].pageY)
                    .subtract({x: cssPos.x, y: cssPos.y});
                this.pos = new Vector(e.touches[0].pageX, e.touches[0].pageY)
                    .subtract({x: cssPos.x, y: cssPos.y});
                this.isDisplay = true;
                this.isFading = false;
                this.alpha = 1;
            }
            this.isActive = true;
            this.checkDebug(console.log, `Joystick Starting...`);
        });

        this.canvas.addEventListener("touchmove", e => {
                let cssPos = this.canvas.getBoundingClientRect();
                let newPos = new Vector(e.touches[0].pageX, e.touches[0].pageY)
                    .subtract({x: cssPos.x, y: cssPos.y})
                    .subtract(this.origin);
                let radius = Math.min(newPos.magnitude, this.outerRadius);
                this.pos.x = this.origin.x + Math.cos(newPos.angle) * radius;
                this.pos.y = this.origin.y + Math.sin(newPos.angle) * radius;

                this.canvas.dispatchEvent(new CustomEvent("joystick", {
                    detail: {
                        e: e,
                        angle: newPos.angle,
                        magnitude: newPos.magnitude,
                        origin: this.origin,
                        client: new Vector(e.touches[0].pageX, e.touches[0].pageY),
                        pos: this.pos,
                        isActive: this.isActive,
                    }
                }));
                e.preventDefault();
                this.checkDebug(console.log, `${~~(newPos.angle * 180 / Math.PI)} angle`);
        });

        this.canvas.addEventListener("touchend", () => {
            if(this.dynamic) {
                this.isActive = false;
                this.isFading = true;
            } else {
                this.pos = new Vector(this.origin.x, this.origin.y);
            }
            this.checkDebug(console.log, `Joystick waiting...`);
        });
    }

    /**
     * @description Shows the actual joystick on the screen
     */
    show() {
        if(this.dynamic) {
            if(this.isDisplay) this.draw();
            this.fadeIn();
        } else {
            this.isFading = false;
            this.isDisplay = true;
            this.alpha = 1;
            this.draw();
        }
        
    }
}


Object.assign(Joystick.prototype, AbstractBaseMixin);
