import { Fractal } from "./index.js";

export interface GPUdata
{
	context: GPUCanvasContext;
	pipeline: GPURenderPipeline;
	paramBindGroup: GPUBindGroup;
	vertexBuffer: GPUBuffer;
	uniformBuffer: GPUBuffer;
}

async function loadShader(url: string): Promise<string>
{
	const response = await fetch(url);
	if (response.ok == false)
	{
		throw new Error(`Failed to load shader: ${url}`);
	}
	return await response.text();
}

export async function setupGPU(canvas: HTMLCanvasElement): Promise<GPUDevice>
{
	if (navigator.gpu == null)
	{
		alert("WebGPU not supported! Try Chrome or Firefox Nightly.");
		throw new Error("WebGPU not supported");
	}
	const adapter = await navigator.gpu.requestAdapter();
	if (adapter == null)
	{
		alert("Failed to get GPU adapter!");
		throw new Error("Failed to get GPU adapter");
	}
	const device = await adapter.requestDevice();
	return device;
}
	
export async function initWebGPU(canvas: HTMLCanvasElement, shader: string, fractal: Fractal, device: GPUDevice): Promise<GPUdata>
{
	const context = canvas.getContext("webgpu") as GPUCanvasContext;
	context.configure({
		device,
		format: "bgra8unorm",
		alphaMode: "opaque"
	});
	const shaderCode = await loadShader(shader);
	const shaderModule = device.createShaderModule({ code: shaderCode });
	const paramBuffer: Float32Array = fractal.asBuffer();
	const gpuBuff: GPUBuffer = device.createBuffer({
		size: paramBuffer.byteLength,
		usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
	});

	device.queue.writeBuffer(
		gpuBuff,
		0,
		paramBuffer.buffer,
		paramBuffer.byteOffset,
		paramBuffer.byteLength
	);
	
	// Create a bind group layout matching your WGSL binding info
	const paramBindGroupLayout = device.createBindGroupLayout({
		entries: [
			{
				binding: 0, // @binding(0)
				visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.VERTEX,
				buffer: { type: 'uniform' }
			}
		]
	});

	const paramBindGroup = device.createBindGroup({
		layout: paramBindGroupLayout,
		entries: [
			{
				binding: 0,
				resource: { buffer: gpuBuff }
			}
		]
	});

	const vertexData = new Float32Array([
		-1, -1,	// bottom left
		1, -1,	// bottom right
		-1, 1,	// top left
		-1, 1,	// top left
		1, -1,	// bottom right
		1, 1,	// top right
	]);

	const vertexBuffer = device.createBuffer({
		size: vertexData.byteLength,
		usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
	});
	device.queue.writeBuffer(vertexBuffer, 0, vertexData.buffer);

	const vertexBufferLayout: GPUVertexBufferLayout = {
		arrayStride: 2 * 4, // 2 floats per vertex, 4 bytes each
		attributes: [{ shaderLocation: 0, format: "float32x2", offset: 0 }]
	};

	const pipeline = device.createRenderPipeline(
	{
		layout: device.createPipelineLayout({
			bindGroupLayouts: [paramBindGroupLayout]
		}),
		vertex: {
			module: shaderModule,
			entryPoint: "vs_main",
			buffers: [vertexBufferLayout]
		},
		fragment: {
			module: shaderModule,
			entryPoint: "main",
			targets: [{ format: "bgra8unorm" }]
		},
		primitive: {
			topology: "triangle-list"
		}
	});
	return { context, pipeline, paramBindGroup, vertexBuffer, uniformBuffer: gpuBuff };
}
