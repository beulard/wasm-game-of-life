// A dependency graph that contains any wasm must all be imported
// asynchronously. This `bootstrap.js` file does the single async import, so
// that no one else needs to worry about it again.
import("./pkg/wasm_game_of_life_bg.wasm")
    .catch(console.error)
    .then(wasm => {
        import("./index");
    });
