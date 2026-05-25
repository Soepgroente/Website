import { Fractal } from "./fractal.js";
export class Julia extends Fractal {
    c;
    constructor(cx, cy, scale, maxIter, resolution, c) {
        super(cx, cy, scale, maxIter, resolution);
        this.c = c;
    }
    asBuffer() {
        return new Float32Array([
            this.center[0],
            this.center[1],
            this.scale,
            this.maxIter,
            this.resolution[0],
            this.resolution[1],
            this.c[0],
            this.c[1]
        ]);
    }
}
//# sourceMappingURL=julia.js.map