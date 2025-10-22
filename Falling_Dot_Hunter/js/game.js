const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreSpan = document.getElementById("score");

// --- 컨트롤(난이도, 시작 버튼) 동적 생성 또는 참조 ---
let startBtn = document.getElementById("startBtn");
let difficultySelect = document.getElementById("difficulty");

if (!startBtn || !difficultySelect) {
    const controls = document.createElement("div");
    controls.id = "controls";
    controls.style.marginBottom = "8px";

    const label = document.createElement("label");
    label.htmlFor = "difficulty";
    label.textContent = "난이도: ";

    difficultySelect = document.createElement("select");
    difficultySelect.id = "difficulty";
    const opts = [
        { v: "2", t: "초보 (느림)" },
        { v: "3", t: "중수 (보통)" },
        { v: "4", t: "고수 (빠름)" },
        { v: "6", t: "왕고수 (매우 빠름)" }
    ];
    opts.forEach(o => {
        const option = document.createElement("option");
        option.value = o.v;
        option.textContent = o.t;
        if (o.v === "3") option.selected = true;
        difficultySelect.appendChild(option);
    });

    startBtn = document.createElement("button");
    startBtn.id = "startBtn";
    startBtn.textContent = "게임 시작";

    controls.appendChild(label);
    controls.appendChild(difficultySelect);
    controls.appendChild(startBtn);

    // 캔버스 위로 삽입
    canvas.parentNode.insertBefore(controls, canvas);
}

// --- 타이머, 목숨, 다시하기 버튼 동적 생성 또는 참조 ---
let timerDiv = document.getElementById("timerDisplay");
let lifeDiv = document.getElementById("lifeDisplay");
let restartBtn = document.getElementById("restartBtn");

if (!timerDiv) {
    timerDiv = document.createElement("div");
    timerDiv.id = "timerDisplay";
    timerDiv.style.marginTop = "10px";
    timerDiv.textContent = "남은 시간: 60초";
    canvas.parentNode.insertBefore(timerDiv, canvas.nextSibling);
}
if (!lifeDiv) {
    lifeDiv = document.createElement("div");
    lifeDiv.id = "lifeDisplay";
    lifeDiv.style.marginTop = "5px";
    lifeDiv.textContent = "목숨: 3";
    timerDiv.parentNode.insertBefore(lifeDiv, timerDiv.nextSibling);
}
if (!restartBtn) {
    restartBtn = document.createElement("button");
    restartBtn.id = "restartBtn";
    restartBtn.textContent = "다시하기";
    restartBtn.style.display = "none";
    lifeDiv.parentNode.insertBefore(restartBtn, lifeDiv.nextSibling);
}

// --- 게임 변수 ---
let cirecle = {
    x: Math.random() * 350 + 25,
    y: 0,
    r: 30,
    speed: 2,
    color: getRandomColor()
};

let score = 0;
let timeLeft = 60; // 1분
let life = 3;
let gameOver = true; // 시작 전에는 true로 두어 자동 실행 방지
let timerInterval = null;
let animationId = null;

// 랜덤 색상 생성
function getRandomColor() {
    const colors = ["red", "blue", "green", "yellow", "purple", "orange"];
    return colors[Math.floor(Math.random() * colors.length)];
}

// 원 리셋
function resetCircle() {
    cirecle.x = Math.random() * (canvas.width - 50) + 25;
    cirecle.y = 0;
    cirecle.color = getRandomColor();
}

// 원 그리기
function drawCircle() {
    ctx.beginPath();
    ctx.arc(cirecle.x, cirecle.y, cirecle.r, 0, Math.PI * 2);
    ctx.fillStyle = cirecle.color;
    ctx.fill();
    ctx.closePath();
}

// 게임 루프
function updateGame() {
    if (gameOver) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCircle();
    cirecle.y += cirecle.speed;

    // 바닥에 닿으면 목숨 차감 및 리셋
    if (cirecle.y - cirecle.r > canvas.height) {
        life--;
        lifeDiv.textContent = "목숨: " + life;
        if (life <= 0) {
            endGame();
            return;
        }
        resetCircle();
    }

    animationId = requestAnimationFrame(updateGame);
}

// 클릭 이벤트(원 잡기)
canvas.addEventListener("click", function(event) {
    if (gameOver) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const dx = mouseX - cirecle.x;
    const dy = mouseY - cirecle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < cirecle.r) {
        score++;
        scoreSpan.textContent = score;
        resetCircle();
    }
});

// 타이머 시작
function startTimer() {
    // 기존 타이머 정리
    if (timerInterval) clearInterval(timerInterval);
    timerDiv.textContent = "남은 시간: " + timeLeft + "초";
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDiv.textContent = "남은 시간: " + timeLeft + "초";

        // 시간 경과에 따른 가속 (예: 40초, 20초일 때)
        if (timeLeft === 40 || timeLeft === 20) {
            cirecle.speed += 1.5;
        }

        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

// 게임 종료
function endGame() {
    gameOver = true;
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    timerDiv.textContent = "게임 종료! 최종 점수: " + score;
    restartBtn.style.display = "inline-block";
    // 시작 버튼 및 난이도 활성화
    startBtn.disabled = false;
    difficultySelect.disabled = false;
}

// 재시작 (현재 선택된 난이도로)
function restartGame() {
    restartBtn.style.display = "none";
    startBtn.disabled = true;
    difficultySelect.disabled = true;

    score = 0;
    timeLeft = 60;
    life = 3;
    scoreSpan.textContent = score;
    lifeDiv.textContent = "목숨: " + life;
    gameOver = false;
    resetCircle();

    // 난이도 적용
    cirecle.speed = parseFloat(difficultySelect.value) || 2;

    startTimer();
    updateGame();
}

// 게임 시작 (Start 버튼 이벤트)
function startGame() {
    // 이미 게임 중이면 무시
    if (!gameOver && timerInterval) return;

    startBtn.disabled = true;
    difficultySelect.disabled = true;
    restartBtn.style.display = "none";

    score = 0;
    timeLeft = 60;
    life = 3;
    scoreSpan.textContent = score;
    lifeDiv.textContent = "목숨: " + life;
    gameOver = false;
    resetCircle();
    cirecle.speed = parseFloat(difficultySelect.value) || 2;

    startTimer();
    updateGame();
}

// 이벤트 바인딩
restartBtn.onclick = restartGame;
startBtn.addEventListener("click", startGame);

// 페이지 로드 시 자동 시작 비활성 (사용자가 난이도 선택 후 시작하도록)
timerDiv.textContent = "난이도를 선택하고 '게임 시작'을 누르세요.";
