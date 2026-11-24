// "Stencil and lighting gels" entrance layers (used by useHeroAnimation).
//
// The headline is cut out of a matte sheet (same colour as the Hero background) and lit from behind:
// - a light box behind the sheet holds one coloured gel per rendered headline line and a white plate;
// - the sheet is a canvas covering only the headline area (with the letters punched out of it), plus a
//   frame whose huge box-shadow covers the rest of the Hero, so the cast-shadow filter stays small;
// - a blurred copy of the letters in the gel colours is the light spilling through the cut-outs.
// Letter positions are measured from the real <h1> character by character, so the cut-outs match the
// rendered text exactly at every breakpoint, whatever the (API-provided) headline says.
// Everything is created once for the entrance and removed by dispose().

const SHEET_COLOR = "#1a1a1a"; // Hero background
const PAD = 60; // room around the headline for the cast shadow and the light spill (px)
const MAX_DPR = 2;
const SHADOW_DEPTH = 14; // initial sheet thickness (px)

// Gel colours, one per rendered line (alternating). The purple is a lighter tint of the Figma #5B2EE0
// so the letters stay legible when lit from behind.
const GEL_COLORS = ["#2dd975", "#6d45f5"] as const;

type Box = { left: number; top: number; width: number; height: number };
type CharBox = Box & { char: string };

export type HeroStencil = {
    root: HTMLElement;
    lightBox: HTMLElement;
    gels: HTMLElement[];
    plate: HTMLElement;
    sheet: HTMLElement[];
    spill: HTMLCanvasElement;
    depth: { value: number };
    applyDepth: () => void;
    dispose: () => void;
};

/** Every non-blank character of the element's text with its rendered box (viewport coordinates). */
function measureChars(element: HTMLElement): CharBox[] {
    const range = document.createRange();
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const chars: CharBox[] = [];

    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const text = node.textContent ?? "";
        for (let i = 0; i < text.length; i++) {
            if (!text[i].trim()) continue;
            range.setStart(node, i);
            range.setEnd(node, i + 1);
            const r = range.getBoundingClientRect();
            if (r.width > 0) chars.push({ char: text[i], left: r.left, top: r.top, width: r.width, height: r.height });
        }
    }

    range.detach();
    return chars;
}

/** Groups characters into rendered lines (same top), returning each line's bounding box. */
function groupLines(chars: CharBox[]): Box[] {
    const lines: Box[] = [];

    chars.forEach((c) => {
        const line = lines.find((l) => Math.abs(l.top - c.top) < c.height / 2);
        if (!line) {
            lines.push({ left: c.left, top: c.top, width: c.width, height: c.height });
            return;
        }
        const right = Math.max(line.left + line.width, c.left + c.width);
        line.left = Math.min(line.left, c.left);
        line.width = right - line.left;
        line.height = Math.max(line.height, c.height);
    });

    return lines.sort((a, b) => a.top - b.top);
}

function lineIndexOf(lines: Box[], c: CharBox) {
    const index = lines.findIndex((l) => Math.abs(l.top - c.top) < c.height / 2);
    return Math.max(0, index);
}

function makeLayer(className: string, box: Box): HTMLElement {
    const el = document.createElement("div");
    el.className = className;
    Object.assign(el.style, {
        left: `${box.left}px`,
        top: `${box.top}px`,
        width: `${box.width}px`,
        height: `${box.height}px`,
    });
    return el;
}

function makeCanvas(className: string, box: Box, dpr: number) {
    const canvas = document.createElement("canvas");
    canvas.className = className;
    canvas.width = Math.round(box.width * dpr);
    canvas.height = Math.round(box.height * dpr);
    Object.assign(canvas.style, {
        left: `${box.left}px`,
        top: `${box.top}px`,
        width: `${box.width}px`,
        height: `${box.height}px`,
    });

    const ctx = canvas.getContext("2d");
    // Draw in Hero coordinates: (box.left, box.top) maps to the canvas origin.
    ctx?.setTransform(dpr, 0, 0, dpr, -box.left * dpr, -box.top * dpr);
    return { canvas, ctx };
}

/**
 * Builds the stencil for the given headline inside the Hero.
 * Returns null when the headline has no measurable text (nothing to cut out).
 */
export function createHeroStencil(hero: HTMLElement, title: HTMLElement): HeroStencil | null {
    const heroRect = hero.getBoundingClientRect();
    const chars = measureChars(title).map((c) => ({
        ...c,
        left: c.left - heroRect.left,
        top: c.top - heroRect.top,
    }));
    if (!chars.length) return null;

    const lines = groupLines(chars);
    const textLeft = Math.min(...lines.map((l) => l.left));
    const textRight = Math.max(...lines.map((l) => l.left + l.width));
    const textTop = lines[0].top;
    const textBottom = Math.max(...lines.map((l) => l.top + l.height));

    const area: Box = {
        left: Math.floor(textLeft - PAD),
        top: Math.floor(textTop - PAD),
        width: Math.ceil(textRight - textLeft + PAD * 2),
        height: Math.ceil(textBottom - textTop + PAD * 2),
    };

    const dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1);
    const style = getComputedStyle(title);
    const font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;

    // ---------- Light box: gels per line + white plate (positions relative to the box) ----------
    const lightBox = makeLayer("hero__stencil-box", area);
    const gels = lines.map((line, index) => {
        const gel = makeLayer("hero__stencil-gel", {
            left: line.left - area.left - 40,
            top: line.top - area.top - 6,
            width: line.width + 80,
            height: line.height + 12,
        });
        gel.style.backgroundColor = GEL_COLORS[index % GEL_COLORS.length];
        lightBox.appendChild(gel);
        return gel;
    });
    const plate = makeLayer("hero__stencil-plate", {
        left: textLeft - area.left - 40,
        top: textTop - area.top - 6,
        width: textRight - textLeft + 80,
        height: textBottom - textTop + 12,
    });
    lightBox.appendChild(plate);

    // ---------- Sheet: canvas with the letters punched out ----------
    const { canvas, ctx } = makeCanvas("hero__stencil-sheet", area, dpr);
    if (!ctx) return null;

    ctx.font = font;
    const metrics = ctx.measureText("Hg");
    // Character boxes are the font's content area, so the baseline sits one font ascent below their top.
    const ascentOf = (c: CharBox) => metrics.fontBoundingBoxAscent || c.height * 0.78;

    ctx.fillStyle = SHEET_COLOR;
    ctx.fillRect(area.left, area.top, area.width, area.height);
    ctx.globalCompositeOperation = "destination-out";
    chars.forEach((c) => ctx.fillText(c.char, c.left, c.top + ascentOf(c)));

    // ---------- Frame: covers the rest of the Hero around the canvas ----------
    const frame = makeLayer("hero__stencil-frame", area);
    frame.style.boxShadow = `0 0 0 200vmax ${SHEET_COLOR}`;

    // ---------- Light spill: the letters again, in the gel colours (blurred in CSS) ----------
    const spillLayer = makeCanvas("hero__stencil-spill", area, dpr);
    if (spillLayer.ctx) {
        const sctx = spillLayer.ctx;
        sctx.font = font;
        chars.forEach((c) => {
            sctx.fillStyle = GEL_COLORS[lineIndexOf(lines, c) % GEL_COLORS.length];
            sctx.fillText(c.char, c.left, c.top + ascentOf(c));
        });
    }
    const spill = spillLayer.canvas;

    // ---------- Assemble (between the background and the content) ----------
    const root = document.createElement("div");
    root.className = "hero__stencil";
    root.setAttribute("aria-hidden", "true");
    // Frame after the canvas, so the sheet's cast shadow never darkens the frame around it.
    root.append(lightBox, canvas, frame, spill);

    const content = hero.querySelector(".container");
    hero.insertBefore(root, content);

    const depth = { value: SHADOW_DEPTH };
    const applyDepth = () => {
        const d = depth.value;
        canvas.style.filter = d > 0.05 ? `drop-shadow(0 ${d * 0.7}px ${d * 0.6}px rgba(0, 0, 0, 0.92))` : "none";
    };
    applyDepth();

    return {
        root,
        lightBox,
        gels,
        plate,
        sheet: [canvas, frame],
        spill,
        depth,
        applyDepth,
        dispose: () => root.remove(),
    };
}