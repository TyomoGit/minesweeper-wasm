use minesweeper::cell;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Status {
    Ok,
    Win,
    Lose,
    Invalid,
}

#[wasm_bindgen]
pub struct Game {
    inner: minesweeper::game::Game,
}

#[wasm_bindgen]
impl Game {
    #[wasm_bindgen(constructor)]
    pub fn new(n_rows: usize, n_cols: usize, n_bombs: usize, init_row: usize, init_col: usize) -> Self {
        Game {
            inner: minesweeper::game::Game::new(n_rows, n_cols, n_bombs, init_row, init_col),
        }
    }

    pub fn open(&mut self, row: usize, col: usize) -> Status {
        match self.inner.open(row, col) {
            Ok(()) => Status::Ok,
            Err(error) => match error {
                minesweeper::error::Error::OutOfBounds
                | minesweeper::error::Error::AlreadyOpened => Status::Invalid,
                minesweeper::error::Error::Lose => Status::Lose,
                minesweeper::error::Error::Win => Status::Win,
            }
        }
    }

    pub fn get_board(&self) -> Vec<i8> {
        let board = self.inner.see_board();
        board.into_iter()
            .flat_map(|row| 
                row
                    .into_iter()
                    .map(|cell| {
                        match cell {
                            Some(cell) => match cell {
                                cell::Cell::Bomb => 9,
                                cell::Cell::Safe(n_bombs) => n_bombs as i8,
                            }
                            None => -1,
                    }}))
            .collect()
    }
}
