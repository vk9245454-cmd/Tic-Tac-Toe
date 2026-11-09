/* =========================================================
   TIC TAC TOE — COMPLETE SCRIPT
   Supports:
   3 × 3 → 3 in a row
   5 × 5 → 4 in a row
   7 × 7 → 5 in a row
   ========================================================= */

const SUPABASE_URL = "https://gjmcwrgjwskbwiofelzr.supabase.co";
const SUPABASE_KEY = "sb_publishable_z8Tnr5vsn-gyY_YuNkYcCw_znM_DOs0";

const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

let playerName = "";
/* =========================================================
   GAME VARIABLES
   ========================================================= */

let board = [];

let boardSize = null;
let winLength = null;

let currentPlayer = "X";

let gameActive = false;
let gameMode = null;
let difficulty = null;


let scores = {
    x: 0,
    o: 0,
    draw: 0
};


/* =========================================================
   DOCUMENT READY
   ========================================================= */

$(document).ready(function () {

    console.log("Tic Tac Toe script loaded.");

    setupBoardSizeButtons();
    setupDifficultyButtons();
    setupGameButtons();
    setupRestartButton();


    // Press Enter in the name input to start the game
    $("#playerName").on("keydown", function (e) {

        if (e.key === "Enter") {
            e.preventDefault();

            $("#playBtn").click();
        }

    });


    updateBoardSize();
    updateScore();

    loadLeaderboard(difficulty);

});

/* =========================================================
   BOARD SIZE
   ========================================================= */

function getWinLength(size) {

    size = Number(size);

    if (size === 3) {
        return 3;
    }

    if (size === 5) {
        return 4;
    }

    if (size === 7) {
        return 5;
    }

    return 3;
}


/* =========================================================
   BOARD SIZE BUTTONS
   ========================================================= */

function setupBoardSizeButtons() {

    $(".board-size-btn")
        .off("click")
        .on("click", function () {

            const selectedSize =
                Number($(this).data("size"));

            if (![3, 5, 7].includes(selectedSize)) {

                console.error(
                    "Invalid board size:",
                    selectedSize
                );

                return;
            }

            boardSize = selectedSize;

            winLength =
                getWinLength(boardSize);

            $(".board-size-btn")
                .removeClass("active");

            $(this)
                .addClass("active");

            updateBoardSize();

            updateStartButton();

            console.log(
                "Selected board:",
                boardSize,
                "Win length:",
                winLength
            );
        });
}


/* =========================================================
   UPDATE BOARD SIZE TEXT
   ========================================================= */

function updateBoardSize() {

    if (![3, 5, 7].includes(Number(boardSize))) {

        $("#currentBoardSize")
            .text("Not selected");

        return;
    }

    $("#currentBoardSize")
        .text(`${boardSize} × ${boardSize}`);
}


/* =========================================================
   CREATE BOARD
   ========================================================= */

function createBoard(size) {

    size = Number(size);

    if (![3, 5, 7].includes(size)) {

        console.error(
            "createBoard(): invalid size:",
            size
        );

        return;
    }

    boardSize = size;

    winLength =
        getWinLength(boardSize);

    board =
        Array(boardSize * boardSize)
            .fill("");

    const $board =
        $("#gameBoard");

    if (!$board.length) {

        console.error(
            "#gameBoard was not found."
        );

        return;
    }


    /* -----------------------------------------------------
       CLEAR OLD BOARD
       ----------------------------------------------------- */

    $board.empty();


    /* -----------------------------------------------------
       REMOVE OLD SIZE CLASSES
       ----------------------------------------------------- */

    $board.removeClass(
        "size-3 size-5 size-7"
    );


    /* -----------------------------------------------------
       ADD CURRENT SIZE CLASS
       ----------------------------------------------------- */

    $board.addClass(
        `size-${boardSize}`
    );


    /* -----------------------------------------------------
       GRID
       ----------------------------------------------------- */

    $board.css({

        display: "grid",

        gridTemplateColumns:
            `repeat(${boardSize}, minmax(0, 1fr))`,

        gridTemplateRows:
            `repeat(${boardSize}, minmax(0, 1fr))`
    });


    /* -----------------------------------------------------
       CREATE CELLS
       ----------------------------------------------------- */

    for (
        let i = 0;
        i < boardSize * boardSize;
        i++
    ) {

        const $cell =
            $("<button>", {

                type: "button",

                class: "cell",

                "data-index": i,

                "aria-label":
                    `Board cell ${i + 1}`
            });


        /*
         * IMPORTANT:
         * The .mark element is required by drawBoard()
         * and by the CSS for X and O.
         */

        const $mark =
            $("<span>")
                .addClass("mark");


        $cell.append($mark);

        $board.append($cell);
    }


    /* -----------------------------------------------------
       CELL CLICK
       ----------------------------------------------------- */

    $board
        .find(".cell")
        .off("click")
        .on("click", function () {

            if (!gameActive) {
                return;
            }

            const index =
                Number(
                    $(this).attr("data-index")
                );

            playerMove(index);
        });


    /* -----------------------------------------------------
       DRAW EMPTY BOARD
       ----------------------------------------------------- */

    drawBoard();

    console.log(
        `Created ${boardSize} × ${boardSize} board`
    );
}


/* =========================================================
   DRAW BOARD
   ========================================================= */

function drawBoard() {

    $("#gameBoard .cell")
        .each(function () {

            const $cell =
                $(this);

            const index =
                Number(
                    $cell.attr("data-index")
                );

            const value =
                board[index] || "";

            const $mark =
                $cell.find(".mark");


            /* ------------------------------------------------
               RESET CELL
               ------------------------------------------------ */

            $cell.removeClass(
                "occupied x-cell o-cell"
            );

            $mark.removeClass(
                "x-mark o-mark"
            );

            $mark.text("");


            /* ------------------------------------------------
               X
               ------------------------------------------------ */

            if (value === "X") {

                $cell.addClass(
                    "occupied x-cell"
                );

                $mark
                    .addClass("x-mark")
                    .text("X");
            }


            /* ------------------------------------------------
               O
               ------------------------------------------------ */

            else if (value === "O") {

                $cell.addClass(
                    "occupied o-cell"
                );

                $mark
                    .addClass("o-mark")
                    .text("O");
            }

        });
}


/* =========================================================
   PLAYER MOVE
   ========================================================= */

function playerMove(index) {

    if (!gameActive) {
        return;
    }

    if (
        index < 0 ||
        index >= board.length
    ) {
        return;
    }

    if (board[index] !== "") {
        return;
    }


    /* -----------------------------------------------------
       PLAYER = X
       ----------------------------------------------------- */

    board[index] = "X";

    drawBoard();


    /* -----------------------------------------------------
       CHECK PLAYER WIN
       ----------------------------------------------------- */

    const winningLine =
        findWinningLine("X");

    if (winningLine) {

        finishGame(
            "X",
            winningLine
        );

        return;
    }


    /* -----------------------------------------------------
       CHECK DRAW
       ----------------------------------------------------- */

    if (isBoardFull()) {

        finishGame(
            "draw",
            []
        );

        return;
    }


    /* -----------------------------------------------------
       AI TURN
       ----------------------------------------------------- */

    currentPlayer = "O";

    gameActive = false;

    setTimeout(function () {

        aiMove();

    }, 350);
}


/* =========================================================
   AI MOVE
   ========================================================= */

function aiMove() {

    if (
        board.length !==
        boardSize * boardSize
    ) {

        console.error(
            "AI: board size mismatch."
        );

        gameActive = true;

        return;
    }


    const emptyCells = [];


    for (
        let i = 0;
        i < board.length;
        i++
    ) {

        if (board[i] === "") {
            emptyCells.push(i);
        }
    }


    if (emptyCells.length === 0) {

        finishGame(
            "draw",
            []
        );

        return;
    }


    let move;


    /* -----------------------------------------------------
       EASY / NORMAL / HARD
       ----------------------------------------------------- */

    if (difficulty === "easy") {

        move =
            randomMove(emptyCells);

    }

    else {

        move =
            findBestMove();
    }


    /* -----------------------------------------------------
       FALLBACK
       ----------------------------------------------------- */

    if (
        move === null ||
        move === undefined
    ) {

        move =
            randomMove(emptyCells);
    }


    board[move] = "O";

    drawBoard();


    /* -----------------------------------------------------
       CHECK AI WIN
       ----------------------------------------------------- */

    const winningLine =
        findWinningLine("O");

    if (winningLine) {

        finishGame(
            "O",
            winningLine
        );

        return;
    }


    /* -----------------------------------------------------
       CHECK DRAW
       ----------------------------------------------------- */

    if (isBoardFull()) {

        finishGame(
            "draw",
            []
        );

        return;
    }


    /* -----------------------------------------------------
       PLAYER TURN
       ----------------------------------------------------- */

    currentPlayer = "X";

    gameActive = true;
}


/* =========================================================
   RANDOM MOVE
   ========================================================= */

function randomMove(emptyCells) {

    if (!emptyCells.length) {
        return null;
    }

    const randomIndex =
        Math.floor(
            Math.random() *
            emptyCells.length
        );

    return emptyCells[randomIndex];
}


/* =========================================================
   BEST MOVE
   ========================================================= */

function findBestMove() {

    const emptyCells = [];

    for (
        let i = 0;
        i < board.length;
        i++
    ) {

        if (board[i] === "") {
            emptyCells.push(i);
        }
    }


    if (!emptyCells.length) {
        return null;
    }


    /* -----------------------------------------------------
       TRY WIN
       ----------------------------------------------------- */

    for (const index of emptyCells) {

        board[index] = "O";

        const win =
            findWinningLine("O");

        board[index] = "";

        if (win) {
            return index;
        }
    }


    /* -----------------------------------------------------
       BLOCK PLAYER
       ----------------------------------------------------- */

    for (const index of emptyCells) {

        board[index] = "X";

        const win =
            findWinningLine("X");

        board[index] = "";

        if (win) {
            return index;
        }
    }


    /* -----------------------------------------------------
       TAKE CENTER
       ----------------------------------------------------- */

    const center =
        Math.floor(board.length / 2);

    if (board[center] === "") {
        return center;
    }


    /* -----------------------------------------------------
       RANDOM
       ----------------------------------------------------- */

    return randomMove(emptyCells);
}


/* =========================================================
   FIND WINNING LINE
   ========================================================= */

function findWinningLine(player) {

    const size =
        Number(boardSize);

    const needed =
        Number(winLength);


    if (
        ![3, 5, 7].includes(size)
    ) {
        return null;
    }


    /* -----------------------------------------------------
       DIRECTIONS
       ----------------------------------------------------- */

    const directions = [

        [0, 1],    // horizontal

        [1, 0],    // vertical

        [1, 1],    // diagonal down-right

        [1, -1]    // diagonal down-left

    ];


    /* -----------------------------------------------------
       SEARCH
       ----------------------------------------------------- */

    for (
        let row = 0;
        row < size;
        row++
    ) {

        for (
            let col = 0;
            col < size;
            col++
        ) {

            const startIndex =
                row * size + col;

            if (
                board[startIndex] !== player
            ) {
                continue;
            }


            for (
                const [dr, dc]
                of directions
            ) {

                const line = [];

                let valid = true;


                for (
                    let step = 0;
                    step < needed;
                    step++
                ) {

                    const newRow =
                        row + dr * step;

                    const newCol =
                        col + dc * step;


                    if (
                        newRow < 0 ||
                        newRow >= size ||
                        newCol < 0 ||
                        newCol >= size
                    ) {

                        valid = false;

                        break;
                    }


                    const index =
                        newRow * size +
                        newCol;


                    if (
                        board[index] !== player
                    ) {

                        valid = false;

                        break;
                    }


                    line.push(index);
                }


                if (valid) {
                    return line;
                }
            }
        }
    }


    return null;
}


/* =========================================================
   BOARD FULL
   ========================================================= */

function isBoardFull() {

    return board.every(
        cell => cell !== ""
    );
}

function updateScores() {
    $("#playerScore").text(playerScore);
    $("#aiScore").text(aiScore);
    $("#drawScore").text(drawScore);
}
/* =========================================================
   FINISH GAME
   ========================================================= */

function finishGame(
    winner,
    winningLine
) {

    gameActive = false;


    /* =====================================================
       HIGHLIGHT WINNING CELLS
       ===================================================== */

    $(".cell")
        .removeClass("winning win");


    if (
        winningLine &&
        winningLine.length
    ) {

        winningLine.forEach(function (index) {

            $(
                `#gameBoard .cell[data-index="${index}"]`
            )
                .addClass("winning");

        });

    }


    /* =====================================================
       UPDATE SCORE
       ===================================================== */

    if (winner === "X") {

        scores.x++;

        updateScore();


        /*
         * SAVE WIN IMMEDIATELY
         * BUT DON'T SHOW RESULT YET
         */

        savePlayerWin();


        /*
         * KEEP WINNING BOARD VISIBLE
         * FOR 1.5 SECONDS
         */

        setTimeout(function () {

            showResult(
                "YOU WIN!",
                "Great move!",
                "x"
            );

        }, 1500);

    }


    else if (winner === "O") {

        scores.o++;

        updateScore();


        setTimeout(function () {

            showResult(
                "AI WINS!",
                "Try again!",
                "o"
            );

        }, 1500);

    }


    else {

        scores.draw++;

        updateScore();


        setTimeout(function () {

            showResult(
                "DRAW!",
                "Nobody wins this round.",
                "draw"
            );

        }, 1500);

    }

}


/* =========================================================
   SHOW RESULT
   ========================================================= */

function showResult(
    title,
    subtitle,
    type
) {

    const $result =
        $("#resultBox");


    /* =====================================================
       RESULT TEXT
       ===================================================== */

    $("#resultText")
        .text(title);

    $("#resultSubtext")
        .text(subtitle);

    $("#resultLabel")
        .text("ROUND COMPLETE");


    /* =====================================================
       LOAD CURRENT DIFFICULTY LEADERBOARD
       ===================================================== */

    loadLeaderboard(difficulty);


    /* =====================================================
       RESULT ICON
       ===================================================== */

    const $icon =
        $(".result-icon i");


    $icon.removeClass(
        "fa-trophy fa-xmark fa-circle"
    );


    if (type === "x") {

        $icon.addClass(
            "fa-trophy"
        );

    }

    else if (type === "o") {

        $icon.addClass(
            "fa-circle"
        );

    }

    else {

        $icon.addClass(
            "fa-circle"
        );

    }


    /* =====================================================
       SHOW RESULT BOX
       ===================================================== */

    $result
        .stop(true, true)
        .fadeIn(180);
}

/* =========================================================
   HIDE RESULT
   ========================================================= */

function hideResult() {

    $("#resultBox")
        .stop(true, true)
        .hide();
}


/* =========================================================
   RESTART ROUND
   ========================================================= */

function restartRound() {

    hideResult();

    $(".cell")
        .removeClass(
            "winning win"
        );

    currentPlayer = "X";

    gameActive = true;

    board =
        Array(boardSize * boardSize)
            .fill("");

    createBoard(boardSize);

    drawBoard();

    updateBoardSize();
}


/* =========================================================
   RESTART BUTTON
   ========================================================= */

function setupRestartButton() {

    $("#restartRoundBtn")
        .off("click")
        .on("click", function () {

            restartRound();

        });
}


/* =========================================================
   NEW ROUND
   ========================================================= */

function newRound() {

    if (!difficulty) {

        console.error(
            "newRound() blocked: no difficulty selected."
        );

        return;
    }

    if (![3, 5, 7].includes(Number(boardSize))) {

        console.error(
            "newRound() blocked: no valid board size selected."
        );

        return;
    }

    const size =
        Number(boardSize);


    if (
        ![3, 5, 7].includes(size)
    ) {

        console.error(
            "newRound(): invalid boardSize:",
            boardSize
        );

        return;
    }


    boardSize = size;

    winLength =
        getWinLength(boardSize);

    currentPlayer = "X";

    gameActive = true;


    /* -----------------------------------------------------
       RESET BOARD
       ----------------------------------------------------- */

    board =
        Array(boardSize * boardSize)
            .fill("");


    /* -----------------------------------------------------
       HIDE RESULT
       ----------------------------------------------------- */

    hideResult();


    /* -----------------------------------------------------
       REMOVE WINNING CELLS
       ----------------------------------------------------- */

    $(".cell")
        .removeClass(
            "winning win"
        );


    /* -----------------------------------------------------
       CREATE NEW BOARD
       ----------------------------------------------------- */

    createBoard(boardSize);

    drawBoard();

    updateBoardSize();


    console.log(
        "New round:",
        boardSize,
        "×",
        boardSize,
        "win:",
        winLength
    );
}


/* =========================================================
   START SELECTED MODE
   ========================================================= */

function startSelectedMode() {

    /* -----------------------------------------------------
       REQUIRE BOTH SELECTIONS
       ----------------------------------------------------- */

    if (!difficulty) {

        console.warn(
            "Cannot start: difficulty not selected."
        );

        return;
    }

    if (![3, 5, 7].includes(Number(boardSize))) {

        console.warn(
            "Cannot start: board size not selected."
        );

        return;
    }


    /* -----------------------------------------------------
       SET WIN LENGTH
       ----------------------------------------------------- */

    boardSize = Number(boardSize);

    winLength =
        getWinLength(boardSize);


    /* -----------------------------------------------------
       UPDATE GAME HEADER
       ----------------------------------------------------- */

    $("#currentMode")
        .text(
            difficulty
                .charAt(0)
                .toUpperCase() +
            difficulty.slice(1)
        );

    $("#currentBoardSize")
        .text(
            `${boardSize} × ${boardSize}`
        );


    /* -----------------------------------------------------
       START ROUND
       ----------------------------------------------------- */

    newRound();

    showGameScreen();

    console.log(
        "Starting selected game:",
        difficulty,
        boardSize + "×" + boardSize,
        "win:",
        winLength
    );
}


/* =========================================================
   SHOW GAME SCREEN
   ========================================================= */

function showGameScreen() {

    showScreen("#gameScreen");

    console.log("Game screen shown.");
}

function showScreen(screenId) {
    $(".screen").removeClass("active-screen");
    $(screenId).addClass("active-screen");
}

/* =========================================================
   SETUP GAME BUTTONS
   ========================================================= */

function setupGameButtons() {
    /* HOME PAGE PLAY BUTTON */

   $("#playBtn")
    .off("click")
    .on("click", function () {

        playerName = $("#playerName").val().trim();

        if (!playerName) {
            $("#playerName").focus();
            return;
        }

        console.log("Player:", playerName);

        showScreen("#modeScreen");

    });

    /* START GAME BUTTON */
    $("#startGameBtn")
        .off("click")
        .on("click", function () {

            startSelectedMode();

        });


    $("#playAgainBtn")
        .off("click")
        .on("click", function () {

            restartRound();

        });


    $("#backToModeBtn")
        .off("click")
        .on("click", function () {

            gameActive = false;

            showScreen("#modeScreen");

        });
}


/* =========================================================
   DIFFICULTY BUTTONS
   ========================================================= */

function setupDifficultyButtons() {

    $(".mode-btn")
        .off("click")
        .on("click", function () {

            const selected =
                $(this).data("mode");

            if (!selected) {
                console.error(
                    "Difficulty button has no data-mode:",
                    this
                );
                return;
            }

            difficulty = String(selected);

            $(".mode-btn")
                .removeClass("active");

            $(this)
                .addClass("active");

            console.log(
                "Selected difficulty:",
                difficulty
            );

            updateStartButton();
        });
}


/* =========================================================
   UPDATE START BUTTON
   ========================================================= */

function updateStartButton() {

    const validDifficulty =
        difficulty !== null &&
        difficulty !== "";

    const validBoard =
        [3, 5, 7].includes(
            Number(boardSize)
        );

    const ready =
        validDifficulty &&
        validBoard;

    $("#startGameBtn")
        .prop("disabled", !ready);

    console.log(
        "Start button:",
        ready ? "ENABLED" : "DISABLED",
        "| difficulty:",
        difficulty,
        "| board:",
        boardSize
    );
}


/* =========================================================
   UPDATE SCORE
   ========================================================= */

function updateScore() {

    $("#playerScore")
        .text(scores.x);

    $("#aiScore")
        .text(scores.o);

    $("#drawScore")
        .text(scores.draw);


    /*
     * These selectors are harmless if your HTML
     * doesn't contain them.
     */

    $("#xScore")
        .text(scores.x);

    $("#oScore")
        .text(scores.o);

    $("#drawScore")
        .text(scores.draw);
}


/* =========================================================
   MENU
   ========================================================= */

function openMenu() {

    $("#gameMenu").addClass("show");
    $("#menuOptions").addClass("show");
    $("#menuBtn").attr("aria-expanded", "true");

}


function closeGameMenu() {

    $("#gameMenu").removeClass("show");
    $("#menuOptions").removeClass("show");
    $("#menuBtn").attr("aria-expanded", "false");

}


/* Compatibility function */
function closeMenu() {
    closeGameMenu();
}


/* =========================================================
   MENU BUTTON
   ========================================================= */

$(document)
    .off("click.gameMenu", "#menuBtn")
    .on(
        "click.gameMenu",
        "#menuBtn",
        function (event) {

            event.preventDefault();
            event.stopPropagation();

            const menuIsOpen =
                $("#menuOptions").hasClass("show");

            if (menuIsOpen) {
                closeGameMenu();
                console.log("Menu closed");
            } else {
                openMenu();
                console.log("Menu opened");
            }
        }
    );


/* =========================================================
   CLOSE MENU WHEN CLICKING OUTSIDE
   ========================================================= */

$(document)
    .off("click.gameMenuOutside")
    .on(
        "click.gameMenuOutside",
        function (event) {

            if (
                !$(event.target).closest("#gameMenu").length &&
                !$(event.target).closest("#menuBtn").length
            ) {
                closeGameMenu();
            }

        }
    );


/* =========================================================
   MENU OPTIONS
   ========================================================= */


/* NEW ROUND */

$(document)
    .off("click.gameMenuNewRound", "#newRoundBtn")
    .on(
        "click.gameMenuNewRound",
        "#newRoundBtn",
        function (event) {

            event.preventDefault();
            event.stopPropagation();

            console.log("New Round clicked");

            newRound();

            closeGameMenu();
        }
    );


/* CHANGE MODE */

$(document)
    .off("click.gameMenuChangeMode", "#changeModeBtn")
    .on(
        "click.gameMenuChangeMode",
        "#changeModeBtn",
        function (event) {

            event.preventDefault();
            event.stopPropagation();

            console.log("Change Mode clicked");

            gameActive = false;

            closeGameMenu();

            showScreen("#modeScreen");
        }
    );


/* RESET SCORE */

$(document)
    .off("click.gameMenuResetScore", "#resetScoreBtn")
    .on(
        "click.gameMenuResetScore",
        "#resetScoreBtn",
        function (event) {

            event.preventDefault();
            event.stopPropagation();

            console.log("Reset Score clicked");

            playerScore = 0;
            aiScore = 0;
            drawScore = 0;

            updateScores();

            newRound();

            closeGameMenu();
        }
    );


/* BACK TO HOME */

$(document)
    .off("click.gameMenuHome", "#backHomeBtnMenu")
    .on(
        "click.gameMenuHome",
        "#backHomeBtnMenu",
        function (event) {

            event.preventDefault();
            event.stopPropagation();

            console.log("Back to Home clicked");

            gameActive = false;

            closeGameMenu();

            showScreen("#homeScreen");
        }
    );


/* =========================================================
   INITIAL SETTINGS
   ========================================================= */

function initializeGame() {

    boardSize = null;
    winLength = null;

    currentPlayer = "X";

    gameActive = false;

    difficulty = null;
    gameMode = null;

    board = [];

    $(".mode-btn")
        .removeClass("active");

    $(".board-size-btn")
        .removeClass("active");

    updateScore();

    updateStartButton();

    console.log(
        "Game initialized. Waiting for difficulty and board size."
    );
}


/* =========================================================
   START
   ========================================================= */

initializeGame();

//! LEADER BOARD 
async function loadLeaderboard(mode) {

    if (!mode) {
        console.error("Leaderboard mode is missing.");
        return;
    }

    const { data, error } = await db
        .from("tic_tac_toe_scores")
        .select("player_name, wins, difficulty")
        .eq("difficulty", mode)
        .order("wins", { ascending: false })
        .limit(5);

    if (error) {
        console.error("Leaderboard error:", error);
        return;
    }

    const $list = $("#leaderboardList");

    $list.empty();

    if (!data || data.length === 0) {

        $list.append(`
            <li>No scores yet</li>
        `);

        return;
    }

    data.forEach(function (player) {

        $list.append(`
            <li>
                <span class="player-name">
                    ${player.player_name}
                </span>

                <strong class="player-wins">
                    ${player.wins} wins
                </strong>
            </li>
        `);

    });
}

//! SAVE WIN

async function savePlayerWin() {

    if (!playerName) {
        console.error("Player name is missing.");
        return;
    }

    if (!difficulty) {
        console.error("Difficulty is missing.");
        return;
    }


    // GET EXISTING SCORE
    const { data: existing, error: selectError } =
        await db
            .from("tic_tac_toe_scores")
            .select("wins")
            .eq("player_name", playerName)
            .eq("difficulty", difficulty)
            .limit(1)
            .maybeSingle();


    if (selectError) {

        console.error(
            "Could not get player score:",
            selectError
        );

        return;
    }


    // PLAYER ALREADY EXISTS FOR THIS DIFFICULTY
    if (existing) {

        const newWins = existing.wins + 1;

        const { error: updateError } =
            await db
                .from("tic_tac_toe_scores")
                .update({
                    wins: newWins,
                    updated_at: new Date().toISOString()
                })
                .eq("player_name", playerName)
                .eq("difficulty", difficulty);


        if (updateError) {

            console.error(
                "Score update error:",
                updateError
            );

            return;
        }


        console.log(
            "Win updated:",
            playerName,
            difficulty,
            newWins
        );

    }


    // FIRST WIN FOR THIS PLAYER + DIFFICULTY
    else {

        const { error: insertError } =
            await db
                .from("tic_tac_toe_scores")
                .insert({
                    player_name: playerName,
                    difficulty: difficulty,
                    wins: 1,
                    updated_at: new Date().toISOString()
                });


        if (insertError) {

            console.error(
                "Score insert error:",
                insertError
            );

            return;
        }


        console.log(
            "First win saved:",
            playerName,
            difficulty,
            1
        );
    }
}