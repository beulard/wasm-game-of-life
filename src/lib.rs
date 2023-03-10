mod utils;

extern crate web_sys;

use fixedbitset;
use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

macro_rules! log {
    ( $( $t:tt )* ) => {
        web_sys::console::log_1(&format!( $( $t )* ).into());
    }
}

#[wasm_bindgen]
pub struct Universe {
    width: u32,
    height: u32,
    cells: fixedbitset::FixedBitSet,
}

impl Universe {
    fn get_index(&self, row: u32, column: u32) -> usize {
        (row * self.width + column) as usize
    }
    fn live_neighbor_count(&self, row: u32, column: u32) -> u8 {
        let mut count = 0;
        for delta_row in [self.height - 1, 0, 1].iter().cloned() {
            for delta_col in [self.width - 1, 0, 1].iter().cloned() {
                if delta_row == 0 && delta_col == 0 {
                    continue;
                }

                let neighbor_row = (row + delta_row) % self.height;
                let neighbor_col = (column + delta_col) % self.width;
                let idx = self.get_index(neighbor_row, neighbor_col);
                count += self.cells[idx] as u8;
            }
        }
        count
    }

    pub fn get_cells(&self) -> &fixedbitset::FixedBitSet {
        &self.cells
    }

    pub fn set_cells(&mut self, cells: &[(u32, u32)]) {
        for (row, col) in cells.iter().cloned() {
            let idx = self.get_index(row, col);
            self.cells.set(idx, true);
        }
    }
}

#[wasm_bindgen]
impl Universe {
    pub fn tick(&mut self) {
        let mut next = self.cells.clone();

        for row in 0..self.height {
            for col in 0..self.width {
                let idx = self.get_index(row, col);
                let cell = self.cells[idx];
                let live_neighbors = self.live_neighbor_count(row, col);

                // log!(
                //     "cell[{}, {}] is initially {:?} and has {} live neighbors",
                //     row,
                //     col,
                //     cell,
                //     live_neighbors
                // );

                next.set(
                    idx,
                    match (cell, live_neighbors) {
                        (true, x) if x < 2 => false,
                        (true, 2) | (true, 3) => true,
                        (true, x) if x > 3 => false,
                        (false, 3) => true,
                        (otherwise, _) => otherwise,
                    },
                );
                // log!("     it becomes {:?}", next[idx]);
            }
        }
        self.cells = next;
    }

    pub fn new(width: u32, height: u32) -> Universe {
        utils::set_panic_hook();

        // // Make a symmetric universe
        // let cells = (0..width * height)
        //     .map(|i| {
        //         if i % 2 == 0 || i % 7 == 0 {
        //             Cell::Alive
        //         } else {
        //             Cell::Dead
        //         }
        //     })
        //     .collect();

        // // Make a single spaceship
        // // ?????????
        // // ?????????
        // // ?????????
        // let mut cells: Vec<Cell> = (0..width * height).map(|_| Cell::Dead).collect();
        // cells[1] = Cell::Alive;
        // cells[width as usize + 2] = Cell::Alive;
        // cells[2 * width as usize + 0] = Cell::Alive;
        // cells[2 * width as usize + 1] = Cell::Alive;
        // cells[2 * width as usize + 2] = Cell::Alive;

        // Make a random universe
        // let cells = (0..width * height)
        //     .map(|_i| if js_sys::Math::random() > 0.5 { 1 } else { 0 })
        //     .collect();

        let size = (width * height) as usize;

        // // Symmetric
        // for i in 0..size {
        //     cells.set(i, i % 2 == 0 || i % 7 == 0);
        // }

        Universe {
            width,
            height,
            cells: fixedbitset::FixedBitSet::with_capacity(size),
        }
    }

    pub fn randomize(&mut self) {
        for i in 0..(self.width() * self.height()) as usize {
            self.cells.set(i, js_sys::Math::random() > 0.5);
        }
    }

    pub fn clear(&mut self) {
        self.cells.clear();
    }

    /*pub fn render(&self) -> String {
        self.to_string()
    }*/

    pub fn width(&self) -> u32 {
        self.width
    }

    pub fn set_width(&mut self, width: u32) {
        self.width = width;
        self.cells = fixedbitset::FixedBitSet::with_capacity((width * self.height) as usize);
    }

    pub fn height(&self) -> u32 {
        self.height
    }

    pub fn set_height(&mut self, height: u32) {
        self.height = height;
        self.cells = fixedbitset::FixedBitSet::with_capacity((self.width * height) as usize);
    }

    pub fn empty(&mut self) {
        self.cells.clear();
    }

    pub fn cells(&self) -> *const u32 {
        self.cells.as_slice().as_ptr()
    }

    pub fn toggle_cell(&mut self, row: u32, col: u32) {
        let idx = self.get_index(row % self.height(), col % self.width());
        self.cells.toggle(idx);
    }
    pub fn activate_cell(&mut self, row: u32, col: u32) {
        let idx = self.get_index(row % self.height(), col % self.width());
        self.cells.set(idx, true);
    }
}

/*use std::fmt;
impl fmt::Display for Universe {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        for line in self.cells.as_slice().chunks(self.width as usize) {
            for &cell in line {
                let symbol = if cell == Cell::Dead { '???' } else { '???' };
                write!(f, "{}", symbol)?;
            }
            write!(f, "\n")?;
        }
        Ok(())
    }
}*/
