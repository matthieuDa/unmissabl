// Procedural texture generators for realistic eye rendering
(function() {
    'use strict';

    function createCanvas(sz){
        const c = document.createElement('canvas');
        c.width = c.height = sz;
        return c;
    }

    function genIrisCanvas(size=2048){
        const c = createCanvas(size);
        const ctx = c.getContext('2d');
        const img = ctx.createImageData(size,size);
        const cx = size/2, cy = size/2;
        
        const irisColorDark = [25, 40, 60];
        const irisColorMid = [50, 100, 150];
        const irisColorLight = [100, 150, 200];
        
        for(let y=0;y<size;y++){
            for(let x=0;x<size;x++){
                const dx = (x-cx)/size*2, dy = (y-cy)/size*2;
                const r = Math.sqrt(dx*dx+dy*dy);
                let v = smoothstep(1.0, 0.2, r);
                const angle = Math.atan2(dy,dx);
                const stripe = Math.pow(Math.abs(Math.sin(angle*8 + r*50 + Math.sin(r*30)*0.5)), 0.85);
                const speck = Math.random()*0.35;
                let intensity = clamp(v * (0.65 + 0.35*stripe) + speck*0.3, 0, 1);
                let colorIdx;
                if (r < 0.4) {
                    colorIdx = irisColorDark;
                } else if (r < 0.7) {
                    const t = (r - 0.4) / 0.3;
                    colorIdx = [
                        Math.floor(irisColorDark[0] * (1 - t) + irisColorMid[0] * t),
                        Math.floor(irisColorDark[1] * (1 - t) + irisColorMid[1] * t),
                        Math.floor(irisColorDark[2] * (1 - t) + irisColorMid[2] * t)
                    ];
                } else {
                    const t = (r - 0.7) / 0.3;
                    colorIdx = [
                        Math.floor(irisColorMid[0] * (1 - t) + irisColorLight[0] * t),
                        Math.floor(irisColorMid[1] * (1 - t) + irisColorLight[1] * t),
                        Math.floor(irisColorMid[2] * (1 - t) + irisColorLight[2] * t)
                    ];
                }
                const i = (y*size + x)*4;
                img.data[i+0] = Math.floor(colorIdx[0] * intensity);
                img.data[i+1] = Math.floor(colorIdx[1] * intensity);
                img.data[i+2] = Math.floor(colorIdx[2] * intensity);
                img.data[i+3] = 255;
            }
        }
        ctx.putImageData(img,0,0);
        ctx.globalAlpha = 0.06;
        for(let i=0;i<8;i++){
            ctx.drawImage(c, Math.random()*4-2, Math.random()*4-2);
        }
        return c;
    }

    function genNormalFromHeightCanvas(heightCanvas, strength=2.0){
        const size = heightCanvas.width;
        const sctx = heightCanvas.getContext('2d');
        const src = sctx.getImageData(0,0,size,size).data;
        const c = createCanvas(size);
        const ctx = c.getContext('2d');
        const out = ctx.createImageData(size,size);
        for(let y=0;y<size;y++){
            for(let x=0;x<size;x++){
                const idx = (y*size + x)*4;
                const h = (src[idx] + src[idx+1] + src[idx+2]) / (255 * 3);
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
        function get(px,py){
            if(px<0) px=0; if(py<0) py=0;
            if(px>=size) px=size-1; if(py>=size) py=size-1;
            const id = (py*size+px)*4;
            return src[id]/255;
        }
        return c;
    }

    function genRingCanvas(size=1024){
        const c = createCanvas(size);
        const ctx = c.getContext('2d');
        const cx=size/2, cy=size/2;
        const grd = ctx.createRadialGradient(cx,cy, size*0.32, cx,cy, size*0.55);
        grd.addColorStop(0, 'rgba(255,255,255,0.75)');
        grd.addColorStop(0.4, 'rgba(220,220,220,0.4)');
        grd.addColorStop(0.8, 'rgba(180,180,180,0.1)');
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grd;
        ctx.fillRect(0,0,size,size);
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, size*0.33, 0, Math.PI*2);
        ctx.stroke();
        return c;
    }

    function genGrainCanvas(size=1024, opacity=0.12){
        const c = createCanvas(size);
        const ctx = c.getContext('2d');
        const img = ctx.createImageData(size,size);
        for(let i=0;i<img.data.length;i+=4){
            const whiteNoise = Math.random() * 255;
            const darkNoise = Math.random() * 100;
            const v = Math.floor(Math.random() > 0.3 ? whiteNoise : darkNoise);
            img.data[i+0]=img.data[i+1]=img.data[i+2]=v;
            img.data[i+3]=Math.floor(255*opacity);
        }
        ctx.putImageData(img,0,0);
        return c;
    }

    function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
    function smoothstep(a,b,x){ const t = clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); }

    if (typeof window !== 'undefined') {
        window.textureGenerators = window.textureGenerators || {};
        window.textureGenerators.genIrisCanvas = genIrisCanvas;
        window.textureGenerators.genNormalFromHeightCanvas = genNormalFromHeightCanvas;
        window.textureGenerators.genRingCanvas = genRingCanvas;
        window.textureGenerators.genGrainCanvas = genGrainCanvas;
    }

})();
