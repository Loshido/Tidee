import { component$, useVisibleTask$ } from "@builder.io/qwik";
import { createNoise3D, type NoiseFunction3D } from "simplex-noise";

class FlowField {
    // element html qui contient le dessin.
    canvas: HTMLCanvasElement

    // interface dessin / js
    ctx: CanvasRenderingContext2D

    field: [number, number][][] = []
    w: number = 0
    h: number = 0
    size: number
    columns: number = 0
    rows: number = 0
    noiseZ: number

    // fonction qui génère du noise;
    simplex: NoiseFunction3D
    constructor() {
        this.simplex = createNoise3D();
        this.size = 25;
        this.noiseZ = 0;

        const canvas = document.querySelector('#flow-field') as HTMLCanvasElement | null;
        if(!canvas) {
            throw new Error("There is no canvas with id 'flow-field'");
        }
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!
        this.reset();

        // On reset lorsque la page change de taille.
        window.addEventListener("resize", this.reset)
    }
    reset() {
        // On ajuste la taille du dessin
        this.w = this.canvas.width = window.innerWidth;
        this.h = this.canvas.height = window.innerHeight;

        this.columns = Math.floor(this.w / this.size) + 1;
        this.rows = Math.floor(this.h / this.size) + 1;
        this.init();
    }
    init() {
        this.field = new Array(this.columns);
        for(let x = 0; x < this.columns; x++) {
            this.field[x] = new Array(this.columns);
            for(let y = 0; y < this.rows; y++) {
                this.field[x][y] = [0, 0];
            }
        }
    }
    compute() {
        for(let x = 0; x < this.columns; x++) {
            for(let y = 0; y < this.rows; y++) {
                const angle = this.simplex(x/50, y/50, this.noiseZ) * Math.PI * 2;
                const length = this.simplex(x/100 + 40000, y/100 + 40000, this.noiseZ);
                this.field[x][y][0] = angle;
                this.field[x][y][1] = length;
            }
        }
    }

    draw(now: number) {
        requestAnimationFrame((n: number) => {
            this.draw(n);
        });
        this.compute();
        this.noiseZ = now * 0.00005;
        this.clear();
        this.drawField();
    }
    clear() {
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0, 0, this.w, this.h);
    }

    drawField() {
        for(let x = 0; x < this.columns; x++) {
            for(let y = 0; y < this.rows; y++) {
                const angle = this.field[x][y][0];
                const length = this.field[x][y][1];
                this.ctx.save();
                this.ctx.translate(x*this.size, y*this.size);
                this.ctx.rotate(angle);
                this.ctx.strokeStyle = "black";
                this.ctx.beginPath();
                this.ctx.moveTo(0, 0);
                this.ctx.lineTo(0, this.size * length);
                this.ctx.stroke();
                this.ctx.restore();
            }
        }
    }
}

export default component$(() => {
    
    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(() => {
        const field = new FlowField();

        field.draw(performance.now())
    })

    return <div class="w-full h-1/4 md:h-full">
        <canvas class="w-full h-full" id="flow-field"/>
    </div>
})