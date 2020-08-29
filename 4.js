export class Component extends Vector {
    constructor(x = 0, y = 0, w = 0, h = 0) {
        super(x, y);
        this.w = w;
        this.h = h;
        this.vel = new Vector(1, 1);

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

    linearJump(arg) {
        if(this.isJumping) {
            if(this.jumpCounter === 0) {
                this.y -= arg.velY;
                if(this.y - this.h < arg.maxHeight) {
                    this.jumpCounter = 1;
                }
            } else {
                arg.velY += arg.gravity;
                this.y += arg.velY;
                if(this.y + this.h > arg.minHeight) {
                    this.isJumping = false;
                    arg.velY = 0;
                    this.jumpCounter = 0;
                }
            }
                
        }
    }


}

class Player extends Vector {
    constructor(x, y) {
        super(x, y);
        this.w = 32;
        this.h = 32;
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
    }
}
