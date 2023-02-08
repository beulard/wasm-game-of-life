import { memory } from "wasm-game-of-life/wasm_game_of_life_bg.wasm";

const CELL_SIZE = 10; // px
const GRID_COLOR = "#cccccc";
const DEAD_COLOR = "#ffffff";
const ALIVE_COLOR = "#222222";

let animationId = null;

const main = (gol) => {
    const universe = gol.Universe.new(32, 48);

    const canvas = document.getElementById("game-of-life-canvas");
    canvas.height = (CELL_SIZE + 1) * universe.height() + 1;
    canvas.width = (CELL_SIZE + 1) * universe.width() + 1;
    const ctx = canvas.getContext('2d');

    const canvasOnClick = (event) => {
        const boundingRect = canvas.getBoundingClientRect();

        const scaleX = canvas.width / boundingRect.width;
        const scaleY = canvas.height / boundingRect.height;

        const canvasLeft = (event.clientX - boundingRect.left) * scaleX;
        const canvasTop = (event.clientY - boundingRect.top) * scaleY;

        let row = Math.min(Math.floor(canvasTop / (CELL_SIZE + 1)), universe.height() - 1);
        let col = Math.min(Math.floor(canvasLeft / (CELL_SIZE + 1)), universe.width() - 1);

        if (event.ctrlKey) {
            // Build a glider
            universe.activate_cell(row, col+1);
            universe.activate_cell(row+1, col+2);
            universe.activate_cell(row+2, col);
            universe.activate_cell(row+2, col+1);
            universe.activate_cell(row+2, col+2);
        }
        else if (event.shiftKey) {
            // Build a pulsar
            // Ensure row, col are positive by adding
            // the universe extent to them.
            // The modulo applied in activate_cell should
            // then find the proper value.
            row += universe.height();
            col += universe.width();
            for (let i of [-1, 1]) {
                for (let j of [-1, 1]) {
                    universe.activate_cell(row+j*6, col+i*4);
                    universe.activate_cell(row+j*6, col+i*3);
                    universe.activate_cell(row+j*6, col+i*2);

                    universe.activate_cell(row+j*4, col+i*6);
                    universe.activate_cell(row+j*4, col+i*1);

                    universe.activate_cell(row+j*3, col+i*6);
                    universe.activate_cell(row+j*3, col+i*1);

                    universe.activate_cell(row+j*2, col+i*6);
                    universe.activate_cell(row+j*2, col+i*1);

                    universe.activate_cell(row+j*1, col+i*4);
                    universe.activate_cell(row+j*1, col+i*3);
                    universe.activate_cell(row+j*1, col+i*2);
                }
            }
        }
        else {
            // Toggle a single cell
            universe.toggle_cell(row, col);
        }
        
        drawGrid(ctx, universe);
        drawCells(ctx, universe);
    }

    canvas.addEventListener("click", canvasOnClick);


    let previousTime = 0;

    let tickTimer = 0;

    let speedMultiplier = 1.0;
    const speedSlider = document.getElementById("speed-slider");
    speedSlider.value = speedMultiplier;
    speedSlider.addEventListener("input", (event) => {
        speedMultiplier = event.target.value;
    });

    const randomButton = document.getElementById("random");
    randomButton.addEventListener("click", () => {
        universe.randomize();
        drawCells(ctx, universe);
    })

    const clearButton = document.getElementById("clear");
    clearButton.addEventListener("click", () => {
        universe.clear();
        drawCells(ctx, universe);
    })

    const renderLoop = (time) => {
        //debugger;
        const elapsed = time - previousTime;
        previousTime = time;

        tickTimer += elapsed;

        if (tickTimer > 16 / speedMultiplier) {
            universe.tick();
            tickTimer = 0;
            //canvas.textContent = universe.render();
            drawGrid(ctx, universe);
            drawCells(ctx, universe);
        }
        animationId = window.requestAnimationFrame(renderLoop);
    }

    const isPaused = () => {
        return animationId === null;
    }

    const playPauseButton = document.getElementById("play-pause");

    const play = () => {
        playPauseButton.textContent = "⏸︎";
        window.requestAnimationFrame(renderLoop);
    }

    const pause = () => {
        playPauseButton.textContent = "▶";
        window.cancelAnimationFrame(animationId);
        animationId = null;
    }

    playPauseButton.addEventListener("click", () => { isPaused() ? play() : pause()});

    // Start the loop
    play();

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
    const cells = new Uint8Array(memory.buffer, cellsPtr, universe.width() * universe.height() / 8);
    for (let i=0; i < universe.width(); ++i) {
        for (let j=0; j < universe.height(); ++j) {
            const alive = bitIsSet(i + j * universe.width(), cells);
            drawCell(ctx, i, j, alive);
        }
    }
}

const bitIsSet = (n, arr) => {
    const byte = Math.floor(n / 8);
    const mask = 1 << (n % 8);
    return (arr[byte] & mask) === mask;
}

import("wasm-game-of-life").then((gol) => {
    main(gol); 
});


