export declare abstract class Fractal {
    center: [number, number];
    scale: number;
    maxIter: number;
    resolution: [number, number];
    constructor(cx: number, cy: number, scale: number, maxIter: number, resolution: [number, number]);
    reset(): void;
    abstract asBuffer(): Float32Array;
}
//# sourceMappingURL=fractal.d.ts.map