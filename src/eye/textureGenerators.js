import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';

// Générateurs simples de textures procédurales pour iris / normal / ring / grain
function createCanvas(sz){
    const c = document.createElement('canvas');
    c.width = c.height = sz;
    return c;
}

function rand(x,y){ // pseudo-rand stable
    return fract(Math.sin(dot(x,y))*43758.5453);
    function dot(a,b){return a*a*12.9898 + b*b*78.233;}
    function fract(v){ return v - Math.floor(v); }
}

export function genIrisCanvas(size=2048){
    const c = createCanvas(size);
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(size,size);
    const cx = size/2, cy = size/2;
    for(let y=0;y<size;y++){
        for(let x=0;x<size;x++){
            const dx = (x-cx)/size*2, dy = (y-cy)/size*2;
            const r = Math.sqrt(dx*dx+dy*dy);
            // base radial falloff
            let v = smoothstep(1.0, 0.2, r);
            // add fibrous noise
            const angle = Math.atan2(dy,dx);
            const stripe = Math.pow(Math.abs(Math.sin(angle*6 + r*40)), 0.9);
            const speck = Math.random()*0.35;
            v = clamp(v * (0.6 + 0.4*stripe) + speck*0.4, 0, 1);
            // map to grayscale iris (we keep color later via shader or multiply)
            const col = Math.floor(255 * v);
            const i = (y*size + x)*4;
            img.data[i+0] = col;
            img.data[i+1] = col;
            img.data[i+2] = col;
            img.data[i+3] = 255;
        }
    }
    ctx.putImageData(img,0,0);
    // soft radial blur for smoothing (cheap)
    ctx.globalAlpha = 0.06;
    for(let i=0;i<6;i++){
        ctx.drawImage(c, Math.random()*6-3, Math.random()*6-3);
    }
    return c;
}

export function genNormalFromHeightCanvas(heightCanvas, strength=2.0){
    const size = heightCanvas.width;
    const sctx = heightCanvas.getContext('2d');
    const src = sctx.getImageData(0,0,size,size).data;
    const c = createCanvas(size);
    const ctx = c.getContext('2d');
    const out = ctx.createImageData(size,size);
    for(let y=0;y<size;y++){
        for(let x=0;x<size;x++){
            const idx = (y*size + x)*4;
            const h = src[idx]/255;
            // finite differences
            const hx = ((get(x+1,y)-get(x-1,y)) * 0.5);
            const hy = ((get(x,y+1)-get(x,y-1)) * 0.5);
            let nx = -hx * strength;
            let ny = -hy * strength;
            let nz = 1.0;
            const len = Math.sqrt(nx*nx + ny*ny + nz*nz);
            nx = nx/len*0.5 + 0.5;
            ny = ny/len*0.5 + 0.5;
            nz = nz/len*0.5 + 0.5;
            const i = idx;
            out.data[i+0] = Math.floor(nx*255);
            out.data[i+1] = Math.floor(ny*255);
            out.data[i+2] = Math.floor(nz*255);
            out.data[i+3] = 255;
        }
    }
    ctx.putImageData(out,0,0);
    return c;

    function get(px,py){
        if(px<0) px=0; if(py<0) py=0;
        if(px>=size) px=size-1; if(py>=size) py=size-1;
        const id = (py*size+px)*4;
        return src[id]/255;
    }
}

export function genRingCanvas(size=1024){
    const c = createCanvas(size);
    const ctx = c.getContext('2d');
    const cx=size/2, cy=size/2;
    const grd = ctx.createRadialGradient(cx,cy, size*0.35, cx,cy, size*0.52);
    grd.addColorStop(0, 'rgba(255,255,255,0.65)');
    grd.addColorStop(0.6, 'rgba(200,200,200,0.25)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0,0,size,size);
    return c;
}

export function genGrainCanvas(size=1024, opacity=0.15){
    const c = createCanvas(size);
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(size,size);
    for(let i=0;i<img.data.length;i+=4){
        const v = Math.floor(Math.random()*255);
        img.data[i+0]=img.data[i+1]=img.data[i+2]=v;
        img.data[i+3]=Math.floor(255*opacity);
    }
    ctx.putImageData(img,0,0);
    return c;
}

// helper math
function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
function smoothstep(a,b,x){ const t = clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); }
// Expose generators on window for easy integration from non-module scripts
if (typeof window !== 'undefined') {
        window.textureGenerators = window.textureGenerators || {};
        window.textureGenerators.genIrisCanvas = genIrisCanvas;
        window.textureGenerators.genNormalFromHeightCanvas = genNormalFromHeightCanvas;
        window.textureGenerators.genRingCanvas = genRingCanvas;
        window.textureGenerators.genGrainCanvas = genGrainCanvas;
}