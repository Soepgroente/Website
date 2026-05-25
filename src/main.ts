/// <reference types="@webgpu/types" />

import { initWebGPU, setupGPU, type GPUdata } from "./setup_gpu.js";
import { Fractal, Mandelbrot, Julia, Nova, Multibrot } from "./index.js";

interface FractalInstance
{
	type: string;
	fractal: Fractal;
	gpuData: GPUdata;
}

let canvas: HTMLCanvasElement;
let currentFractal: FractalInstance;
let fractals: FractalInstance[] = [];
let device: GPUDevice;
let dragging = false;

function resizeCanvasToFullWindow()
{
	const dpr = window.devicePixelRatio || 1;

	canvas.width = Math.round(window.innerWidth * dpr);
	canvas.height = Math.round(window.innerHeight * dpr);

	canvas.style.width = window.innerWidth + 'px';
	canvas.style.height = window.innerHeight + 'px';
}

function draw(fractal: Fractal, data: GPUdata)
{
	fractal.resolution = [canvas.width, canvas.height];

	device.queue.writeBuffer(
		data.uniformBuffer,
		0,
		fractal.asBuffer().buffer,
		fractal.asBuffer().byteOffset,
		fractal.asBuffer().byteLength
	);
	const commandEncoder = device.createCommandEncoder();
	const textureView = data.context.getCurrentTexture().createView();
	const renderPass = commandEncoder.beginRenderPass({
		colorAttachments: [{
			view: textureView,
			clearValue: { r: 0, g: 0, b: 0, a: 1 },
			loadOp: "clear",
			storeOp: "store"
		}]
	});
	renderPass.setPipeline(data.pipeline);
	renderPass.setBindGroup(0, data.paramBindGroup);
	renderPass.setVertexBuffer(0, data.vertexBuffer);
	renderPass.draw(6, 1, 0, 0); // Draw 2 triangles (6 verts)
	renderPass.end();
	device.queue.submit([commandEncoder.finish()]);
}

function switchFractal(type: string)
{
	currentFractal = fractals.find(f => f.type == type)!;
	if (currentFractal == null)
	{
		alert(`Fractal type not found: ${type}`);
		throw new Error(`Fractal type not found: ${type}`);
	}
	draw(currentFractal.fractal, currentFractal.gpuData);
}

async function loadFractalInstances(): Promise<FractalInstance[]>
{
	const instances: FractalInstance[] = [];
	const mandelbrot = new Mandelbrot(-0.75, 0, 3, 500, [800, 600]);
	const julia = new Julia(0, 0, 3, 500, [800, 600], [-0.8, 0.156]);
	const nova = new Nova(0, 0, 3, 500, [800, 600]);
	const multibrot = new Multibrot(-0.75, 0, 3, 500, [800, 600], 2);

	instances.push({
		type: "mandelbrot",
		fractal: mandelbrot,
		gpuData: await initWebGPU(canvas, "shaders/mandelbrot.wgsl", mandelbrot, device)
	});
	instances.push({
		type: "julia",
		fractal: julia,
		gpuData: await initWebGPU(canvas, "shaders/julia.wgsl", julia, device)
	});
	instances.push({
		type: "nova",
		fractal: nova,
		gpuData: await initWebGPU(canvas, "shaders/nova.wgsl", nova, device)
	});
	instances.push({
		type: "multibrot",
		fractal: multibrot,
		gpuData: await initWebGPU(canvas, "shaders/multibrot.wgsl", multibrot, device)
	});
	return instances;
}

function updateJuliaUnderPointer(pointer: PointerEvent)
{
	if (currentFractal.type != "mandelbrot") return;

	const rect = canvas.getBoundingClientRect();
	const dpr = window.devicePixelRatio || 1;
	const x = (pointer.clientX - rect.left) * dpr;
	const y = (pointer.clientY - rect.top) * dpr;

	const width = canvas.width;
	const height = canvas.height;
	const aspect = width / height;

	const mandel = currentFractal.fractal;
	const c_re = (x / width  - 0.5) * mandel.scale * aspect + mandel.center[0];
	const c_im = (y / height - 0.5) * mandel.scale + mandel.center[1];

	const juliaInstance = fractals.find(f => f.type == "julia");
	if (juliaInstance == null)
	{
		throw new Error("Julia fractal not found!");
	}
	const julia = juliaInstance.fractal as Julia;
	julia.c = [c_re, c_im];
	julia.center = mandel.center;
	julia.scale = mandel.scale;
	draw(julia, juliaInstance.gpuData);
}

async function initializeInteractiveElements()
{
	window.addEventListener("resize", () =>
	{
		resizeCanvasToFullWindow();
		currentFractal.fractal.resolution = [canvas.width, canvas.height];
		draw(currentFractal.fractal, currentFractal.gpuData);
	});

	window.addEventListener("keydown", e =>
	{
		const fr = currentFractal.fractal;
		const step = fr.scale * 0.05;
		switch (e.key)
		{
			case "ArrowLeft":  fr.center[0] -= step; break;
			case "ArrowRight": fr.center[0] += step; break;
			case "ArrowUp":    fr.center[1] -= step; break;
			case "ArrowDown":  fr.center[1] += step; break;
			case "a": fr.center[0] -= step; break;
			case "d": fr.center[0] += step; break;
			case "w": fr.center[1] -= step; break;
			case "s": fr.center[1] += step; break;
			case "r": fr.reset(); break;
			case "q": fr.scale *= 0.8; break;
			case "e": fr.scale *= 1.25; break;
			case "+": fr.maxIter = Math.min(2500, Math.floor(fr.maxIter * 1.5)); break;
			case "-": fr.maxIter = Math.max(10, Math.floor(fr.maxIter / 1.5)); break;
			case "1":
				if (currentFractal.type == "multibrot")
				{
					(currentFractal.fractal as Multibrot).exponent = Math.max(2, (currentFractal.fractal as Multibrot).exponent - 1);
				}
				break;
			case "2":
				if (currentFractal.type == "multibrot")
				{
					(currentFractal.fractal as Multibrot).exponent = Math.min(10, (currentFractal.fractal as Multibrot).exponent + 1);
				}
				break;
			default: return;
		}
		draw(currentFractal.fractal, currentFractal.gpuData);
	});

	canvas.addEventListener("wheel", e =>
	{
		e.preventDefault();

		const frac = currentFractal.fractal;
		const rect = canvas.getBoundingClientRect();
		const dpr = window.devicePixelRatio || 1;
		const mouseX = (e.clientX - rect.left) * dpr;
		const mouseY = (e.clientY - rect.top) * dpr;
		const width = canvas.width;
		const height = canvas.height;
		const aspect = width / height;

		const before_real = (mouseX / width - 0.5) * frac.scale * aspect + frac.center[0];
		const before_imag = (mouseY / height - 0.5) * frac.scale + frac.center[1];

		frac.scale *= e.deltaY < 0 ? 0.8 : 1.25;

		const after_real = (mouseX / width - 0.5) * frac.scale * aspect + frac.center[0];
		const after_imag = (mouseY / height - 0.5) * frac.scale + frac.center[1];

		frac.center[0] += before_real - after_real;
		frac.center[1] += before_imag - after_imag;

		draw(currentFractal.fractal, currentFractal.gpuData);
	});

	const activeTouches = new Map<number, [number, number]>();

	canvas.addEventListener("pointerdown", e =>
	{
		// if (e.pointerType == "touch" && activeTouches.has(e.pointerId) == true)
		// {
		// 	activeTouches.set(e.pointerId, [e.clientX, e.clientY]);
		// }
		// if (activeTouches.size == 2)
		// {

		// }
		if (currentFractal.type == "mandelbrot")
		{
			dragging = true;
			updateJuliaUnderPointer(e);
		}
	});

	canvas.addEventListener("pointermove", e =>
	{
		if (dragging == true && currentFractal.type == "mandelbrot")
		{
			updateJuliaUnderPointer(e);
		}
	});

	canvas.addEventListener("pointerup", e =>
	{
		dragging = false;
		draw(currentFractal.fractal, currentFractal.gpuData);
	});

	document.getElementById("mandelbrot")!.onclick = () => switchFractal("mandelbrot");
	document.getElementById("multibrot")!.onclick = () => switchFractal("multibrot");
	document.getElementById("nova")!.onclick = () => switchFractal("nova");
}

async function start()
{
	canvas = document.getElementById("gfx") as HTMLCanvasElement;
	device = await setupGPU(canvas);
	await initializeInteractiveElements();
	fractals = await loadFractalInstances();
	if (fractals == null || fractals.length == 0)
	{
		alert("Failed to load fractal instances!");
		throw new Error("Failed to load fractal instances");
	}
	switchFractal("mandelbrot");
	resizeCanvasToFullWindow();
	draw(currentFractal.fractal, currentFractal.gpuData);
}

start();