import { memory } from "wasm-game-of-life/wasm_game_of_life_bg.wasm";

const CELL_SIZE = 10; // px
const GRID_COLOR = "#cccccc";
const DEAD_COLOR = "#ffffff";
const ALIVE_COLOR = "#222222";

const main = (gol) => {
    const universe = gol.Universe.new(128, 64);

    const canvas = document.getElementById("game-of-life-canvas");
    canvas.height = (CELL_SIZE + 1) * universe.height() + 1;
    canvas.width = (CELL_SIZE + 1) * universe.width() + 1;

    const ctx = canvas.getContext('2d');

    let previousTime = 0;

    let tickTimer = 0;

    const renderLoop = (time) => {
        const elapsed = time - previousTime;
        previousTime = time;

        tickTimer += elapsed;

        if (tickTimer > 16) {
            universe.tick();
            tickTimer = 0;
            canvas.textContent = universe.render();
            drawGrid(ctx, universe);
            drawCells(ctx, universe);
        }
        requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);

}

const drawGrid = (ctx, universe) => {
    ctx.beginPath();
    ctx.strokeStyle = GRID_COLOR;

    // Vertical lines
    for (let i =0; i <= universe.width(); i++) {
        ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
        ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * universe.height() + 1);
    }
    // Horizontal lines
    for (let i = 0; i <= universe.height(); i++) {
        ctx.moveTo(0, i * (CELL_SIZE + 1) + 1);
        ctx.lineTo((CELL_SIZE + 1) * universe.width() + 1, i * (CELL_SIZE + 1) + 1);
    }
    ctx.stroke();
}

const drawCell = (ctx, x, y, alive) => {
    ctx.beginPath();
    ctx.fillStyle = alive ? ALIVE_COLOR : DEAD_COLOR;

    const startx = x * (CELL_SIZE + 1) + 1
    const starty = y * (CELL_SIZE + 1) + 1
    ctx.moveTo(startx, starty);
    ctx.lineTo(startx + CELL_SIZE, starty);
    ctx.lineTo(startx + CELL_SIZE, starty + CELL_SIZE);
    ctx.lineTo(startx, starty + CELL_SIZE);

    ctx.fill();
}

const drawCells = (ctx, universe) => {
    const cellsPtr = universe.cells();
    const cells = new Uint8Array(memory.buffer, cellsPtr, universe.width() * universe.height());
    for (let i=0; i < universe.width(); ++i) {
        for (let j=0; j < universe.height(); ++j) {
            drawCell(ctx, i, j, cells[j * universe.width() + i]); 
        }
    }
}

import("wasm-game-of-life").then((gol) => {
    main(gol); 
});


