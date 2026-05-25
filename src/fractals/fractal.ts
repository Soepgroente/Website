export abstract class Fractal
{
	center: [number, number];
	scale: number;
	maxIter: number;
	resolution: [number, number];

	constructor(cx: number, cy: number, scale: number, maxIter: number, resolution: [number, number])
	{
		this.center = [cx, cy];
		this.scale = scale;
		this.maxIter = maxIter;
		this.resolution = resolution;
	}

	reset()
	{
		this.center = [-0.75, 0];
		this.scale = 2.5;
		this.maxIter = 500;
		this.resolution = [800, 600];
	}

	abstract asBuffer(): Float32Array;
}