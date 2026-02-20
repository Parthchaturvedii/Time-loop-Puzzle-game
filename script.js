// ================= AUDIO =================
const bgMusic = new Audio("");
bgMusic.loop = true;

const clickSound = new Audio("click.mp3");
const winSound = new Audio("win.mp3");
const failSound = new Audio("fail.mp3");
const openDoor = new Audio("doorOpenSound.mp3");

function playSound(sound){
sound.currentTime=0;
sound.play().catch(()=>{});
}

let musicStarted=false;
document.body.addEventListener("click",()=>{
if(!musicStarted){
bgMusic.play().catch(()=>{});
musicStarted=true;
}
});

// ================= SOLANA =================
const {Connection,clusterApiUrl,PublicKey,Transaction} = solanaWeb3;
const connection = new Connection(clusterApiUrl("devnet"));

let wallet=null;

document.getElementById("connectWallet").onclick = async ()=>{
if(window.solana && window.solana.isPhantom){
const response = await window.solana.connect();
wallet=response.publicKey;
document.getElementById("walletAddress").innerText =
"Connected: "+wallet.toString();
loadLeaderboard();
}else{
alert("Install Phantom Wallet");
}
};

// ================= LEVELS =================
let levels=[
{time:60,clues:["desk-note"]},
{time:50,clues:["desk-note","clock-code"]},
{time:45,clues:["desk-note","clock-code","box-clue"]},
{time:35,clues:["desk-note","clock-code","box-clue"]},
{time:30,clues:["desk-note","clock-code","special-clue"]}
];

let level=1;
let memory={};
let timeLeft;
let timer;

// ================= GAME =================
function startLevel(){
clearInterval(timer);
timeLeft=levels[level-1].time;

document.getElementById("level").innerText="Level "+level;
document.getElementById("story").innerText=
"You wake up in a locked room.";

startTimer();
updateMemory();
}

function startTimer(){
timer=setInterval(()=>{
timeLeft--;
document.getElementById("timer").innerText=
"Time Left: "+timeLeft;

if(timeLeft<=0){
clearInterval(timer);
playSound(failSound);
document.getElementById("story").innerText=
"⏳ Time resets… but memory remains.";
setTimeout(startLevel,1500);
}
},1000);
}

// ================= INTERACTIONS =================
function inspectDesk(){
playSound(clickSound);
memory["desk-note"]=true;
document.getElementById("story").innerText=
"You found a note: 'The clock hides truth.'";
updateMemory();
}

function inspectClock(){
playSound(clickSound);
if(memory["desk-note"]){
memory["clock-code"]=true;
document.getElementById("story").innerText=
"Clock frozen at 4:2:7.";
}else{
document.getElementById("story").innerText=
"Just a normal clock.";
}
updateMemory();
}

function inspectBox(){
playSound(clickSound);
memory["box-clue"]=true;
document.getElementById("story").innerText=
"You found a hidden pattern.";
updateMemory();
}

function inspectSpecial(){
playSound(clickSound);
if(level===5){
memory["special-clue"]=true;
document.getElementById("story").innerText=
"Final hidden clue found!";
}else{
document.getElementById("story").innerText=
"Nothing here.";
}
updateMemory();
}

function inspectDoor(){
playSound(clickSound);

let required=levels[level-1].clues;
let solved=required.every(c=>memory[c]);

if(solved){
clearInterval(timer);
playSound(openDoor);
level++;

if(level>levels.length){
let finalScore=(level*100)+timeLeft;
document.getElementById("story").innerText=
"🏆 Escaped! Score: "+finalScore;
playSound(winSound);
submitScore(finalScore);
return;
}

memory={};
setTimeout(startLevel,1500);

}else{
document.getElementById("story").innerText=
"Door locked. Missing clues.";
}
}

function updateMemory(){
let items=Object.keys(memory).filter(k=>memory[k]);
document.getElementById("memory").innerText=
"🧠 Memory: "+(items.length?items.join(", "):"None");
}

// ================= ON-CHAIN SCORE =================
async function submitScore(score){
if(!wallet){
alert("Connect wallet first!");
return;
}

const memo=JSON.stringify({
game:"TimeLoopEscape",
player:wallet.toString(),
score:score,
time:Date.now()
});

const instruction=new solanaWeb3.TransactionInstruction({
keys:[],
programId:new PublicKey(
"MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
),
data:new TextEncoder().encode(memo)
});

const transaction=new Transaction().add(instruction);
transaction.feePayer=wallet;
transaction.recentBlockhash=
(await connection.getLatestBlockhash()).blockhash;

const signed=await window.solana.signTransaction(transaction);
const signature=
await connection.sendRawTransaction(signed.serialize());

await connection.confirmTransaction(signature);

alert("Score stored on-chain!");
loadLeaderboard();
}

async function loadLeaderboard(){
if(!wallet) return;

const signatures=
await connection.getSignaturesForAddress(wallet,{limit:5});

let html="";
for(let sig of signatures){
html+=`<p>${sig.signature.slice(0,30)}...</p>`;
}

document.getElementById("leaderboard").innerHTML=
html||"No scores yet.";
}

startLevel();
