import { Fractal } from "./fractal.js";

export class Multibrot extends Fractal
{
	exponent: number;

	constructor(cx: number, cy: number, scale: number, maxIter: number, resolution: [number, number], exponent: number = 2)
	{
		super(cx, cy, scale, maxIter, resolution);
		this.exponent = exponent;
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
			this.exponent,
			0
		]);
	}
}