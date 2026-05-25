/// <reference types="@webgpu/types" />
import { initWebGPU, setupGPU } from "./setup_gpu.js";
import { Mandelbrot, Julia, Nova, Multibrot } from "./index.js";
let canvas;
let currentFractal;
let fractals = [];
let device;
function resizeCanvasToFullWindow() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
}
function draw(data) {
    const frac = currentFractal.fractal;
    frac.resolution = [canvas.width, canvas.height];
    device.queue.writeBuffer(data.uniformBuffer, 0, frac.asBuffer().buffer, frac.asBuffer().byteOffset, frac.asBuffer().byteLength);
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
function switchFractal(type) {
    currentFractal = fractals.find(f => f.type == type);
    if (currentFractal == null) {
        alert(`Fractal type not found: ${type}`);
        throw new Error(`Fractal type not found: ${type}`);
    }
    draw(currentFractal.gpuData);
}
async function loadFractalInstances() {
    const instances = [];
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
async function start() {
    canvas = document.getElementById("gfx");
    device = await setupGPU(canvas);
    fractals = await loadFractalInstances();
    if (fractals == null || fractals.length == 0) {
        alert("Failed to load fractal instances!");
        throw new Error("Failed to load fractal instances");
    }
    switchFractal("mandelbrot");
    window.addEventListener("resize", () => {
        resizeCanvasToFullWindow();
        currentFractal.fractal.resolution = [canvas.width, canvas.height];
        draw(currentFractal.gpuData);
    });
    window.addEventListener("keydown", e => {
        const fr = currentFractal.fractal;
        const step = fr.scale * 0.05;
        switch (e.key) {
            case "ArrowLeft":
                fr.center[0] -= step;
                break;
            case "ArrowRight":
                fr.center[0] += step;
                break;
            case "ArrowUp":
                fr.center[1] -= step;
                break;
            case "ArrowDown":
                fr.center[1] += step;
                break;
            case "a":
                fr.center[0] -= step;
                break;
            case "d":
                fr.center[0] += step;
                break;
            case "w":
                fr.center[1] -= step;
                break;
            case "s":
                fr.center[1] += step;
                break;
            case "r":
                fr.reset();
                break;
            case "q":
                fr.scale *= 0.8;
                break;
            case "e":
                fr.scale *= 1.25;
                break;
            case "+":
                fr.maxIter = Math.min(2500, Math.floor(fr.maxIter * 1.5));
                break;
            case "-":
                fr.maxIter = Math.max(10, Math.floor(fr.maxIter / 1.5));
                break;
            case "1":
                if (currentFractal.type == "multibrot") {
                    currentFractal.fractal.exponent = Math.max(2, currentFractal.fractal.exponent - 1);
                }
                break;
            case "2":
                if (currentFractal.type == "multibrot") {
                    currentFractal.fractal.exponent = Math.min(10, currentFractal.fractal.exponent + 1);
                }
                break;
            default: return;
        }
        draw(currentFractal.gpuData);
    });
    canvas.addEventListener("wheel", e => {
        const zoom = e.deltaY < 0 ? 0.8 : 1.25;
        currentFractal.fractal.scale *= zoom;
        draw(currentFractal.gpuData);
    });
    document.getElementById("mandelbrot").onclick = () => switchFractal("mandelbrot");
    document.getElementById("multibrot").onclick = () => switchFractal("multibrot");
    document.getElementById("nova").onclick = () => switchFractal("nova");
    resizeCanvasToFullWindow();
    draw(currentFractal.gpuData);
}
start();
//# sourceMappingURL=main.js.map