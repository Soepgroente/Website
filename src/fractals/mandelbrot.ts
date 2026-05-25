import { Fractal } from "./fractal.js";

export class Mandelbrot extends Fractal
{
	constructor(cx: number, cy: number, scale: number, maxIter: number, resolution: [number, number])
	{
		super(cx, cy, scale, maxIter, resolution);
	}

	asBuffer(): Float32Array
	{
		return new Float32Array([this.center[0], this.center[1], this.scale, this.maxIter, this.resolution[0], this.resolution[1], 0, 0]);
	}
}