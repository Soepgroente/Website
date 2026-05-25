export declare class Params {
    center: [number, number];
    scale: number;
    maxIter: number;
    resolution: [number, number];
    constructor(cx: number, cy: number, scale: number, maxIter: number, resolution: [number, number]);
    reset(): void;
    asBuffer(): Float32Array;
}
//# sourceMappingURL=Params.d.ts.map