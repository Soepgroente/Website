import { Fractal } from "./fractal.js";
export class Multibrot extends Fractal {
    exponent;
    constructor(cx, cy, scale, maxIter, resolution, exponent = 2) {
        super(cx, cy, scale, maxIter, resolution);
        this.exponent = exponent;
    }
    asBuffer() {
        return new Float32Array([
            this.center[0],
            this.center[1],
            this.scale,
            this.maxIter,
            this.resolution[0],
            this.resolution[1],
            this.exponent,
            0
        ]);
    }
}
//# sourceMappingURL=multibrot.js.map