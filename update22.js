export * as mat from "https://cdn.jsdelivr.net/gh/Mirielle2004/modular-test@master/smodule.js";

export const PI = 3.14;


export class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

Object.defineProperties(Math, {
    radToDeg: {
        value: function(n) {
            return n * 180 / this.PI;
        },
        enumerable: true,
        configurable: true
    }
});

function hello() {
    console.log("roygbiv");
}

export default function area(x, y) {
    console.log(x * y);
}


export const Vector2 = (function() {
    function Vector2(x, y) {
        this.x = x;
        this.y = y;
    }
    Vector2.prototype.add = function(v) {
        return new Vector2(this.x + v.x, this.y + v.y)
    }
    return Vector2;
})();
