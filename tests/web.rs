//! Test suite for the Web and headless browsers.

#![cfg(target_arch = "wasm32")]

extern crate js_sys;
extern crate wasm_bindgen_test;
extern crate wasm_game_of_life;
use wasm_bindgen::prelude::*;
use wasm_bindgen_test::*;
use wasm_game_of_life::Universe;

wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
fn pass() {
    assert_eq!(1 + 1, 2);
}

#[cfg(test)]
pub fn input_spaceship() -> Universe {
    let mut universe = Universe::new(6, 6);
    universe.empty();
    universe.set_cells(&[(1, 2), (2, 3), (3, 1), (3, 2), (3, 3)]);
    universe
}

#[cfg(test)]
pub fn expected_spaceship() -> Universe {
    let mut universe = Universe::new(6, 6);
    universe.empty();
    universe.set_cells(&[(2, 1), (2, 3), (3, 2), (3, 3), (4, 2)]);
    universe
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen_test]
pub fn test_tick() {
    let mut input_universe = input_spaceship();
    // log(&format!("{:b}", input_universe.get_cells()));

    let expected_universe = expected_spaceship();
    // log(&format!("{:b}", expected_universe.get_cells()));

    input_universe.tick();
    // log(&format!("{:b}", input_universe.get_cells()));

    assert_eq!(&input_universe.get_cells(), &expected_universe.get_cells());
}
