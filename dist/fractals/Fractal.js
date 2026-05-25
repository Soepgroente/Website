export class Fractal {
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
}
//# sourceMappingURL=fractal.js.map