// mandelbrot.wgsl

struct Params
{
	center: vec2<f32>,
	scale: f32,
	maxIter: f32,
	resolution: vec2<f32>,
	coordinate: vec2<f32>,
	padding: vec2<f32>
};
@group(0) @binding(0) var<uniform> params: Params;

@fragment
fn main(@builtin(position) pos: vec4<f32>) -> @location(0) vec4<f32>
{
	let aspect = params.resolution.x / params.resolution.y;
	let uv = (pos.xy / vec2(params.resolution.x, params.resolution.y) - vec2(0.5, 0.5)) * vec2(params.scale * aspect, params.scale) + params.center;
	var c = vec2(uv.x, uv.y);
	var z = vec2(coordinate.x, coordinate.y);
	var i: f32 = 0.0;
	while (i < params.maxIter && dot(z, z) <= 4.0)
	{
		let x = z.x * z.x - z.y * z.y + c.x;
		let y = 2.0 * z.x * z.y + c.y;
		z = vec2(x, y);
		i = i + 1.0;
	}
	if (i == params.maxIter)
	{
		return vec4(0.0, 0.0, 0.0, 1.0);
	}
	let t = f32(i) / f32(params.maxIter);
	let angle = 2.0 * 3.1415926 * t;
	let r = 0.5 + 0.5 * cos(angle + 2.0 * 3.1415926 / 3.0);
	let g = 0.5 + 0.5 * cos(angle + 4.0 * 3.1415926 / 3.0);
	let b = 1.0 - (0.5 + 0.5 * cos(angle + 2.0 * 3.1415926 / 3.0));
	let color = vec3(r, g, b);
	return vec4(color, 1.0);
}

@vertex
fn vs_main(@location(0) position: vec2<f32>) -> @builtin(position) vec4<f32>
{
	return vec4(position, 0.0, 1.0);
}