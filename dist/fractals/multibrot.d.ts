import { Fractal } from "./fractal.js";
export declare class Multibrot extends Fractal {
    exponent: number;
    constructor(cx: number, cy: number, scale: number, maxIter: number, resolution: [number, number], exponent?: number);
    asBuffer(): Float32Array;
}
//# sourceMappingURL=multibrot.d.ts.map