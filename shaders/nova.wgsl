// mandelbrot.wgsl

struct Params
{
	center: vec2<f32>,
	scale: f32,
	maxIter: f32,
	resolution: vec2<f32>,
	padding: vec2<f32>
};
@group(0) @binding(0) var<uniform> params: Params;

fn complex_add(a: vec2<f32>, b: vec2<f32>) -> vec2<f32>
{
	return vec2(
		a.x + b.x,
		a.y + b.y
	);
}

fn complex_sub(a: vec2<f32>, b: vec2<f32>) -> vec2<f32>
{
	return vec2(
		a.x - b.x,
		a.y - b.y
	);
}

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

fn	complex_div(a: vec2<f32>, b: vec2<f32>) -> vec2<f32>
{
	var conjugate = vec2(b.x, -b.y);
	var newA = complex_mul(a, conjugate);
	var newB = complex_mul(b, conjugate);
	return vec2(newA.x / newB.x, newA.y / newB.x);
}

fn	nova_formula(z: vec2<f32>, c: vec2<f32>) -> vec2<f32>
{
	var	z1 = z;
	var	z2 = z;
	var	num = vec2(1.0, 0.0);

	z1 = complex_power(z1, 3);
	z1 = complex_sub(z1, num);
	z2 = complex_mul(z2, z2);
	num.x = 3;
	z2 = complex_mul(z2, num);
	z1 = complex_div(z1, z2);
	z1 = complex_sub(z, z1);
	z1 = complex_add(z1, c);
	return z1;
}

fn	black_hole(z: vec2<f32>, z_prev: vec2<f32>) -> i32
{
	var a = vec2(1.0, 0.0);
	var b = vec2(-0.5, 0.86602540378);
	var c = vec2(-0.5, -0.86602540378);
	var	tol = f32(0.0001);

	if (abs(z.x - a.x) < tol && abs(z.y - a.y) < tol)
	{
		return 0;
	}
	else if (abs(z.x - b.x) < tol && abs(z.y - b.y) < tol)
	{
		return 64;
	}
	else if (abs(z.x - c.x) < tol && abs(z.y - c.y) < tol)
	{
		return 128;
	}
	else if (abs(z.x - z_prev.x) < tol && abs(z.y - z_prev.y) < tol)
	{
		return 16;
	}
	return -1;
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
	var z = vec2(1.0, 0.0);
	var z_prev = vec2(0.0, 0.0);
	var i: i32 = 0;
	var max = i32(params.maxIter);
	while (i < max)
	{
		z_prev = z;
		z = nova_formula(z, c);
		var thingy = black_hole(z, z_prev);
		if (thingy != -1)
		{
			i += thingy;
			break;
		}
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