"use client";

import { gsap, ScrollTrigger } from "@/lib/gsap";

// The Figma "giphy-1" animation (48 frames of 125 × 125 at 25 fps), packed into one sprite sheet:
// 8 columns × 6 rows, in playback order.
const FRAME = 125;
const COLUMNS = 8;
const FRAME_COUNT = 48;
const SOURCE_FPS = 25;

// The canvas is drawn small and scaled up by CSS (smoke is soft, so this costs nothing visually):
// its longest side is at most this many pixels.
const MAX_RESOLUTION = 480;

/** One smoke layer: a slowed-down, cross-faded playback of the frames, drifting on its own. */
type Layer = {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    /** Playback speed relative to the GIF (below 1 = slower, more fluid). */
    speed: number;
    /** Frame offset, so the layers never show the same frame. */
    phase: number;
    /** Mirrored horizontally (the second layer), so its plumes don't line up with the first. */
    mirror: boolean;
    /** Animated by GSAP: offset (fraction of the panel), extra zoom and tilt (degrees). */
    drift: { x: number; y: number; zoom: number; tilt: number };
};

function createLayer(speed: number, phase: number, mirror: boolean): Layer | null {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return null;
    return { canvas, context, speed, phase, mirror, drift: { x: 0, y: 0, zoom: 0, tilt: 0 } };
}

/**
 * Slow, never-identical drift: each property swings back and forth on its own period (periods chosen
 * so they don't line up), so the combined movement doesn't visibly repeat.
 */
function animateDrift(layer: Layer, periods: [number, number, number, number], range: number) {
    const { drift } = layer;
    const [px, py, pz, pt] = periods;
    const swing = (prop: keyof Layer["drift"], from: number, to: number, duration: number) => {
        gsap.fromTo(drift, { [prop]: from }, { [prop]: to, duration, ease: "sine.inOut", repeat: -1, yoyo: true });
    };
    swing("x", -0.03 * range, 0.03 * range, px);
    swing("y", -0.025 * range, 0.025 * range, py);
    swing("zoom", 0, 0.08 * range, pz);
    swing("tilt", -1.5 * range, 1.5 * range, pt);
}

/**
 * Draws one layer at a given time: the current frame, then the next one on top at the in-between
 * amount, so the slowed playback flows instead of stepping (this also hides the GIF's loop seam).
 * The frames cover the panel as in Figma (image fill "Fill"), overscaled a little so the drift never
 * shows an edge.
 */
function drawLayer(layer: Layer, sprite: HTMLImageElement, time: number) {
    const { canvas, context, drift } = layer;
    const { width, height } = canvas;

    const position = (time * SOURCE_FPS * layer.speed + layer.phase) % FRAME_COUNT;
    const index = Math.floor(position);
    const blend = position - index;

    const cover = Math.max(width, height) / FRAME;
    const size = FRAME * cover * (1.12 + drift.zoom);

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, width, height);
    context.translate(width / 2 + drift.x * width, height / 2 + drift.y * height);
    context.rotate((drift.tilt * Math.PI) / 180);
    if (layer.mirror) context.scale(-1, 1);

    const frame = (n: number) => {
        const i = n % FRAME_COUNT;
        context.drawImage(sprite, (i % COLUMNS) * FRAME, Math.floor(i / COLUMNS) * FRAME, FRAME, FRAME, -size / 2, -size / 2, size, size);
    };

    context.globalAlpha = 1;
    frame(index);
    context.globalAlpha = blend;
    frame(index + 1);
}

/**
 * Figma "giphy-1" smoke, brought to life: two layers of the Figma animation, each slowed down and
 * cross-faded, the second mirrored, out of phase and at another speed, both drifting slowly in
 * different rhythms. They are blended (screen) into the visible canvas, which CSS shows at Figma's 5%.
 * Draws only while the section is on screen (and the browser tab visible: the GSAP ticker sleeps
 * otherwise). Returns a cleanup function; drift tweens and the ScrollTrigger belong to the calling GSAP
 * context, which reverts them.
 */
export function setupSmoke(canvas: HTMLCanvasElement, trigger: HTMLElement, onReady: () => void) {
    const context = canvas.getContext("2d");
    const src = canvas.dataset.src;
    if (!context || !src) return () => {};

    const base = createLayer(0.38, 0, false);
    const echo = createLayer(0.27, FRAME_COUNT / 2, true);
    if (!base || !echo) return () => {};
    animateDrift(base, [13, 17, 21, 19], 1);
    animateDrift(echo, [16, 11, 23, 14], 1.3);

    // Canvas resolution follows the panel's proportions (longest side MAX_RESOLUTION).
    const resize = () => {
        const { width, height } = canvas.getBoundingClientRect();
        if (!width || !height) return;
        const scale = MAX_RESOLUTION / Math.max(width, height);
        const w = Math.max(1, Math.round(width * scale));
        const h = Math.max(1, Math.round(height * scale));
        [canvas, base.canvas, echo.canvas].forEach((c) => {
            c.width = w;
            c.height = h;
        });
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const sprite = new Image();
    let ready = false;
    let running = false;

    const render = (time: number) => {
        if (!ready) return;
        drawLayer(base, sprite, time);
        drawLayer(echo, sprite, time);

        context.globalCompositeOperation = "source-over";
        context.globalAlpha = 1;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(base.canvas, 0, 0);
        context.globalCompositeOperation = "screen";
        context.globalAlpha = 0.55;
        context.drawImage(echo.canvas, 0, 0);
    };

    const start = () => {
        if (running) return;
        running = true;
        gsap.ticker.add(render);
    };
    const stop = () => {
        running = false;
        gsap.ticker.remove(render);
    };

    const visibility = ScrollTrigger.create({
        trigger,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (self.isActive ? start() : stop()),
    });

    sprite.decoding = "async";
    sprite.onload = () => {
        ready = true;
        render(gsap.ticker.time); // first frame straight away, before handing over from the still texture
        onReady();
        if (visibility.isActive) start();
    };
    sprite.src = src;

    return () => {
        stop();
        observer.disconnect();
        sprite.onload = null;
    };
}