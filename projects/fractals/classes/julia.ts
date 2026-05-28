import { Fractal } from "./classes/fractal.js";

export class Julia extends Fractal
{
	c: [number, number];

	constructor(cx: number, cy: number, scale: number, maxIter: number, resolution: [number, number], c: [number, number])
	{
		super(cx, cy, scale, maxIter, resolution);
		this.c = c;
	}

	asBuffer(): Float32Array
	{
		return new Float32Array(
		[
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