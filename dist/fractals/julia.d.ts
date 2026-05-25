import { Fractal } from "./fractal.js";
export declare class Julia extends Fractal {
    c: [number, number];
    constructor(cx: number, cy: number, scale: number, maxIter: number, resolution: [number, number], c: [number, number]);
    asBuffer(): Float32Array;
}
//# sourceMappingURL=julia.d.ts.map