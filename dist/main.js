/// <reference types="@webgpu/types" />
import { Params } from "./index.js";
let params = new Params(-0.75, 0, 2.5, 500, [1920, 1080]);
let currentGPUdata;
let canvas;
// type FractalType = "mandelbrot" | "julia" | "multibrot" | "nova";
// const fractalPipelines =
// {
// 	mandelbrot: mandelbrotPipeline,
// 	julia: juliaPipeline,
// 	multibrot: multibrotPipeline,
// 	nova: novaPipeline
// };
async function loadShader(url) {
    const response = await fetch(url);
    if (response.ok == false) {
        throw new Error(`Failed to load shader: ${url}`);
    }
    return await response.text();
}
function resizeCanvasToFullWindow() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
}
async function initWebGPU() {
    if (navigator.gpu == null) {
        alert("WebGPU not supported! Try Chrome or Firefox Nightly.");
        throw new Error("WebGPU not supported");
    }
    canvas = document.getElementById("gfx");
    const adapter = await navigator.gpu.requestAdapter();
    if (adapter == null) {
        alert("Failed to get GPU adapter!");
        throw new Error("Failed to get GPU adapter");
    }
    const device = await adapter.requestDevice();
    const context = canvas.getContext("webgpu");
    if (context == null) {
        alert("Failed to get WebGPU context!");
        throw new Error("Failed to get WebGPU context");
    }
    // fetch WGSL shader file
    context.configure({
        device,
        format: "bgra8unorm",
        alphaMode: "opaque"
    });
    const shaderCode = await loadShader("shaders/mandelbrot.wgsl");
    const shaderModule = device.createShaderModule({ code: shaderCode });
    params.resolution = [canvas.width, canvas.height];
    const paramBuffer = params.asBuffer();
    const gpuBuff = device.createBuffer({
        size: 8 * 4,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(gpuBuff, 0, paramBuffer.buffer, paramBuffer.byteOffset, paramBuffer.byteLength);
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
        -1, -1, // bottom left
        1, -1, // bottom right
        -1, 1, // top left
        -1, 1, // top left
        1, -1, // bottom right
        1, 1, // top right
    ]);
    const vertexBuffer = device.createBuffer({
        size: vertexData.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    });
    device.queue.writeBuffer(vertexBuffer, 0, vertexData.buffer);
    const vertexBufferLayout = {
        arrayStride: 2 * 4, // 2 floats per vertex, 4 bytes each
        attributes: [{ shaderLocation: 0, format: "float32x2", offset: 0 }]
    };
    const pipeline = device.createRenderPipeline({
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
    return { device, context, pipeline, paramBindGroup, vertexBuffer, uniformBuffer: gpuBuff };
}
function draw(data) {
    const canvas = document.getElementById("gfx");
    params.resolution = [canvas.width, canvas.height];
    data.device.queue.writeBuffer(data.uniformBuffer, 0, params.asBuffer().buffer, params.asBuffer().byteOffset, params.asBuffer().byteLength);
    const commandEncoder = data.device.createCommandEncoder();
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
    data.device.queue.submit([commandEncoder.finish()]);
}
async function start() {
    currentGPUdata = await initWebGPU();
    canvas = document.getElementById("gfx");
    resizeCanvasToFullWindow();
    window.addEventListener("resize", () => {
        resizeCanvasToFullWindow();
        params.resolution = [canvas.width, canvas.height];
        draw(currentGPUdata);
    });
    window.addEventListener("keydown", e => {
        const step = params.scale * 0.05;
        switch (e.key) {
            case "ArrowLeft":
                params.center[0] -= step;
                break;
            case "ArrowRight":
                params.center[0] += step;
                break;
            case "ArrowUp":
                params.center[1] -= step;
                break;
            case "ArrowDown":
                params.center[1] += step;
                break;
            case "a":
                params.center[0] -= step;
                break;
            case "d":
                params.center[0] += step;
                break;
            case "w":
                params.center[1] -= step;
                break;
            case "s":
                params.center[1] += step;
                break;
            case "r":
                params.reset();
                break;
            case "q":
                params.scale *= 0.8;
                break;
            case "e":
                params.scale *= 1.25;
                break;
            case "+":
                params.maxIter = Math.min(2500, Math.floor(params.maxIter * 1.5));
                break;
            case "-":
                params.maxIter = Math.max(10, Math.floor(params.maxIter / 1.5));
                break;
            default: return;
        }
        draw(currentGPUdata);
    });
    canvas.addEventListener("wheel", e => {
        const zoom = e.deltaY < 0 ? 0.8 : 1.25;
        params.scale *= zoom;
        draw(currentGPUdata);
    });
    draw(currentGPUdata);
}
start();
//# sourceMappingURL=main.js.map