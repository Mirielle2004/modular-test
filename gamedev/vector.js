class Vector {
    /**
     * @constructor
     * @param {Number} x value for the x-component
     * @param {Numer} y value for the y-component
     * @param {Number} w value for the w-component of the vector
     * The w component is always useless but then it can be useful
     */
    constructor(x, y, w=1) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.length = Math.hypot(this.x, this.y);
        this.angle = Math.atan2(this.y, this.x);
    }

    /**
     * @description add this vector with another
     * @param {Vector} vec vector to be added to this
     */
    add(vec) {
        return new Vector(this.x + vec.x, this.y + vec.y);
    }

    /**
     * @description subtracts a vector from this
     * @param {Vector} vec vector to be subtracted from this
     */
    sub(vec) {
        return new Vector(this.x - vec.x, this.y - vec.y);
    }

    /**
     * @description check how much this vector is projected to another
     * @param {Vector} vec vector to be tested against this
     * @returns {Number} scalar qunatity
     */
    dot(vec) {
        return this.x * vec.x + this.y * vec.y;
    }

    /**
     * @description scale this vector by a scalar
     * @param {Numer} scalar a scalar quantity
     */
    scale(scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    }

    /**
     * @description add a function to each componenet of the vector
     * @param {Function} func function to be applied to each component of the vector
     */
    applyFunc(func) {
        return new Vector(func(this.x), func(this.y));
    }

    /**
     * @description handy method to add and scale on the same line
     * @param {Vector} vec vector to be added to this
     * @param {Number} scalar how much should the added vector be scaled
     */
    addScale(vec, scalar) {
        return new Vector(this.x + vec.x * scalar, this.y + vec.y * scalar);
    }

    static fromArray(arr) {
        return new Vector(arr[0], arr[1]);
    }
 
    static fromObject(obj) {
        return new Vector(obj.x, obj.y);
    }
}
