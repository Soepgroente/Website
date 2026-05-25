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
    reset() {
        this.center = [-0.75, 0];
        this.scale = 2.5;
        this.maxIter = 500;
        this.resolution = [800, 600];
    }
    asBuffer() {
        return new Float32Array([this.center[0], this.center[1], this.scale, this.maxIter, this.resolution[0], this.resolution[1], 0, 0]);
    }
}
//# sourceMappingURL=Params.js.map