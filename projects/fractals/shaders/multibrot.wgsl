// multibrot.wgsl

struct Params
{
	center: vec2<f32>,
	scale: f32,
	maxIter: f32,
	resolution: vec2<f32>,
	power: f32,
	padding: f32
};
@group(0) @binding(0) var<uniform> params: Params;

fn complex_mul(a: vec2<f32>, b: vec2<f32>) -> vec2<f32>
{
	return vec2(
		a.x * b.x - a.y * b.y,
		a.x * b.y + a.y * b.x
	);
}

fn complex_power(z: vec2<f32>, power: i32) -> vec2<f32>
{
	var result = z;
	for (var i = 1; i < power; i = i + 1)
	{
		result = complex_mul(result, z);
	}
	return result;
}

fn	calc_color(iter: i32) -> vec4<f32>
{
	let i = f32(iter) % 256.0;
	let t = i / 256.0;
	let angle = 2.0 * 3.1415926 * t;
	let r = 0.5 + 0.5 * cos(angle + 2.0 * 3.1415926 / 3.0);
	let g = 0.5 + 0.5 * cos(angle + 4.0 * 3.1415926 / 3.0);
	let b = 1.0 - (0.5 + 0.5 * cos(angle + 2.0 * 3.1415926 / 3.0));
	return vec4(r, g, b, 1.0);
}

@fragment
fn main(@builtin(position) pos: vec4<f32>) -> @location(0) vec4<f32>
{
	let aspect = params.resolution.x / params.resolution.y;
	let uv = (pos.xy / vec2(params.resolution.x, params.resolution.y) - vec2(0.5, 0.5)) * vec2(params.scale * aspect, params.scale) + params.center;
	var c = vec2(uv.x, uv.y);
	var z = vec2(0.0, 0.0);
	var i: i32 = 0;
	var max = i32(params.maxIter);
	var pow = i32(params.power);
	while (i < max && dot(z, z) <= 4.0)
	{
		z = complex_power(z, pow) + c;
		i++;
	}
	if (i == max)
	{
		return vec4(0.0, 0.0, 0.0, 1.0);
	}
	return calc_color(i);
}

@vertex
fn vs_main(@location(0) position: vec2<f32>) -> @builtin(position) vec4<f32>
{
	return vec4(position, 0.0, 1.0);
}