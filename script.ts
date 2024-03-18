import wasmInit, * as wasm from "./pkg/minesweeper_wasm.js";

const difficultySelect = document.getElementById("difficultySelect") as HTMLSelectElement;
const container = document.querySelector(".container");
const messageField = document.getElementById("messageField");

let table: HTMLTableElement;
let started = false;
let game: wasm.Game;
let settings: Settings;

type Settings = {
    rows: number,
    cols: number,
    bombs: number
};

wasmInit()
    .then(() => {
        init();
    });

function init() {
    initEventListeners();
    settings = difficultyInfo(difficultySelect?.value);
    table = createTable(settings);
    container?.appendChild(table);
}

function reset() {
    container?.removeChild(table);
    init();
}

function initEventListeners() {
    difficultySelect?.addEventListener("change", () => {
        reset();
    });
}

function difficultyInfo(difficulty: string): Settings {
    switch (difficulty) {
        default:
        case "easy":
            return { rows: 9, cols: 9, bombs: 10 };
        case "medium":
            return { rows: 16, cols: 16, bombs: 40 };
        case "hard":
            return { rows: 16, cols: 30, bombs: 99 };
    };
}

function createTable(size: Settings): HTMLTableElement {
    const table = document.createElement("table");
    for (let i = 0; i < size.rows; i++) {
        const row = document.createElement("tr");
        for (let j = 0; j < size.cols; j++) {
            const cell = document.createElement("td");
            initTd(cell);
            row.appendChild(cell);
        }
        table.appendChild(row);
    }
    return table;
}

function initTd(td: HTMLTableCellElement) {
    td.addEventListener("click", () => {
        if (td.classList.contains("opened")) {
            return;
        }

        const row = (td.parentElement as HTMLTableRowElement).rowIndex;
        const col = td.cellIndex;

        if (!started) {
            game = new wasm.Game(settings.rows, settings.cols, settings.bombs, row, col);
        }

        started = true;

        const status = game.open(row, col);
        switch (status) {
            case wasm.Status.Win:
                alert("You win!");
                updateMessageField("You win!");
                break;
            case wasm.Status.Lose:
                alert("You lose!");
                updateMessageField("You lose!");
                break;
            case wasm.Status.Invalid:
                console.log("Invalid");
                break;
            case wasm.Status.Ok:
                break;
        }

        updateTable(game.get_board());
    });
}

function updateTable(board: Int8Array) {
    for (let i = 0; i < board.length; i++) {
        const row = Math.floor(i / settings.cols);
        const col = i % settings.cols;

        const info = board[i];

        if (info == -1) {
            ;
        } else {
            const td = getTd(row, col);
            if (td) {
                let text = info.toString();
                if (text == "9") {
                    text = "💣";
                } else if (text == "0") {
                    td.classList.add("zero");
                }
                td.innerText = text;
                td.classList.add("opened");
            }
        }


    }
}

function getTd(row: number, col: number) {
    return table?.rows[row]?.cells[col];
}

function updateMessageField(message: string) {
    if (messageField) {
        messageField.innerText = message;
    }
}
