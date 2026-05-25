export class Params {
    center;
    scale;
    maxIter;
    resolution;
    constructor(cx, cy, scale, maxIter, resolution) {
        this.center = [cx, cy];
        this.scale = scale;
        this.maxIter = maxIter;
        this.resolution = resolution;
    }
    asBuffer() {
        return new Float32Array([this.center[0], this.center[1], this.scale, this.maxIter, this.resolution[0], this.resolution[1], 0, 0]);
    }
}
//# sourceMappingURL=Params.js.map