// ====== LEVEL CONFIGURATION ======
let levels = [
  {
    time: 60,
    actions: Infinity,
    clues: ["desk-note"],
    fakes: []
  },
  {
    time: 50,
    actions: Infinity,
    clues: ["desk-note", "clock-code"],
    fakes: ["box-fake"]
  },
  {
    time: 50,
    actions: 4,
    clues: ["desk-note", "clock-code"],
    fakes: ["box-fake"]
  },
  {
    time: 45,
    actions: 5,
    clues: ["desk-note", "clock-code", "box-clue"],
    fakes: ["fake-note"]
  },
  {
    time: 30,
    actions: 4,
    clues: ["desk-note", "clock-code", "special-clue"],
    fakes: ["fake-note", "misleading-box"]
  }
];

// ====== GLOBAL VARIABLES ======
let level = 1;
let memory = {};
let timeLeft = levels[level - 1].time;
let actionsLeft = levels[level - 1].actions;
let timer;

// ====== START LEVEL ======
function startLevel() {
    clearInterval(timer);
    memory = memory || {};
    let current = levels[level - 1];

    timeLeft = current.time;
    actionsLeft = current.actions;

    document.getElementById("level").innerText = `Level ${level}`;
    document.getElementById("story").innerText = "You wake up in a locked room.";
    updateMemory();
    startTimer();
}

// ====== TIMER ======
function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById("timer").innerText = `Time Left: ${timeLeft}`;
        if (timeLeft <= 0) resetLoop();
    }, 1000);
}

// ====== RESET LOOP ======
function resetLoop() {
    clearInterval(timer);
    document.getElementById("story").innerText = "⏳ Time resets… but your memory remains.";
    startLevel();
}

// ====== ACTION LIMIT CHECK ======
function useAction() {
    if (actionsLeft !== Infinity) {
        if (actionsLeft <= 0) {
            document.getElementById("story").innerText = "No actions left in this loop!";
            return false;
        }
        actionsLeft--;
    }
    return true;
}

// ====== INTERACTIONS ======
function inspectDesk() {
    if (!useAction()) return;
    if (!memory["desk-note"]) {
        memory["desk-note"] = true;
        document.getElementById("story").innerText = "You find a note: 'The clock hides the truth.'";
    } else {
        document.getElementById("story").innerText = "You check the desk again. Nothing new.";
    }
    updateMemory();
}

function inspectClock() {
    if (!useAction()) return;
    if (memory["desk-note"]) {
        memory["clock-code"] = "427";
        document.getElementById("story").innerText = "The clock is frozen at 4:2:7.";
    } else {
        document.getElementById("story").innerText = "A ticking clock. Nothing unusual.";
    }
    updateMemory();
}

function inspectBox() {
    if (!useAction()) return;
    let msg = "";
    if (level === 3 || level >= 4) {
        memory["box-clue"] = true;
        msg = "You find a strange pattern inside the box.";
    } else {
        msg = "An empty box.";
    }
    document.getElementById("story").innerText = msg;
    updateMemory();
}

function inspectSpecial() {
    if (!useAction()) return;
    if (level === 5) {
        memory["special-clue"] = true;
        document.getElementById("story").innerText = "You found a final clue hidden in the room!";
    } else {
        document.getElementById("story").innerText = "Nothing special here.";
    }
    updateMemory();
}


function inspectDoor() {
    if (!useAction()) return;
    let currentClues = levels[level - 1].clues; // For Level 5: ["desk-note","clock-code","special-clue"]
    let solved = currentClues.every(clue => memory[clue]);

    if (solved) {
        clearInterval(timer);
        level++;
        if (level > levels.length) {
            document.getElementById("story").innerText = "🏆 You escaped all loops. You mastered time!";
            document.getElementById("memory").innerText = "Memory cleared!";
            return;
        }
        document.getElementById("story").innerText = "🚪 The door opens… time shifts.";
        setTimeout(startLevel, 1500);
    } else {
        document.getElementById("story").innerText = "The door is locked. You’re missing something.";
    }
}


// ====== UPDATE MEMORY DISPLAY ======
function updateMemory() {
    let memItems = Object.keys(memory).filter(key => memory[key]);
    document.getElementById("memory").innerText = "🧠 Memory: " + (memItems.length ? memItems.join(", ") : "None");
}

// ====== INITIALIZE GAME ======
startLevel();
