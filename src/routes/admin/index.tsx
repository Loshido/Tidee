import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";

const SIZE = 25;
const setup = (canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width;
    canvas.height = rect.height;
    const ctx = canvas.getContext('2d');
    if(!ctx) return;
    ctx.imageSmoothingEnabled = false
    const [w, h] = [rect.width, rect.height];

    for(let x = 0; x < w; x = x + SIZE) {
        for(let y = 0; y < h; y = y + SIZE) {
            ctx.fillStyle = `hsl(${(x + y) % 360}deg, 100%, 50%)`
            ctx.fillRect(x, y, SIZE, SIZE);
        }
    }
}

export default component$(() => {
    const canvas = useSignal<HTMLCanvasElement>()

    useVisibleTask$(() => {
        if(!canvas.value) return;
        setup(canvas.value)
    })
    return <canvas class="w-full h-full" ref={canvas}/>
})