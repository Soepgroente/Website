import { Fractal } from "./index.js";
export interface GPUdata {
    context: GPUCanvasContext;
    pipeline: GPURenderPipeline;
    paramBindGroup: GPUBindGroup;
    vertexBuffer: GPUBuffer;
    uniformBuffer: GPUBuffer;
}
export declare function setupGPU(canvas: HTMLCanvasElement): Promise<GPUDevice>;
export declare function initWebGPU(canvas: HTMLCanvasElement, shader: string, fractal: Fractal, device: GPUDevice): Promise<GPUdata>;
//# sourceMappingURL=setup_gpu.d.ts.map