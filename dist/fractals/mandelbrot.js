import { Fractal } from "./fractal.js";
export class Mandelbrot extends Fractal {
    constructor(cx, cy, scale, maxIter, resolution) {
        super(cx, cy, scale, maxIter, resolution);
    }
    asBuffer() {
        return new Float32Array([this.center[0], this.center[1], this.scale, this.maxIter, this.resolution[0], this.resolution[1], 0, 0]);
    }
}
//# sourceMappingURL=mandelbrot.js.map