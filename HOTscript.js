const keywords = [
  { word: "AI", score: 90 },
  { word: "저출산", score: 80 },
  { word: "인플레이션", score: 75 },
  { word: "K-POP", score: 88 },
  { word: "친환경", score: 70 },
  { word: "우주", score: 65 },
  { word: "디지털노마드", score: 60 },
  { word: "로봇", score: 35 },
  { word: "ESG", score: 68 },
  { word: "메타버스", score: 77 },
  { word: "탄소중립", score: 72 },
  { word: "빅데이터", score: 83 },
  { word: "챗GPT", score: 95 },
  { word: "제로웨이스트", score: 62 },
  { word: "헬스케어", score: 74 },
  { word: "자율주행", score: 79 },
  { word: "청년정책", score: 55 },
  { word: "비대면", score: 58 },
  { word: "사이버보안", score: 76 },
  { word: "기후위기", score: 64 }
];

const container = document.getElementById("word-flow-container");
const lines = 4;
const lineHeight = container.offsetHeight / lines;
let usedLines = new Set();

function random(min, max) {
  return Math.random() * (max - min) + min;
}
function getAvailableY(fontSize) {
    if (usedLines.size >= lines) usedLines.clear();
    let line;
    do {
        line = Math.floor(Math.random() * lines);
    } while (usedLines.has(line));

    usedLines.add(line);
    const y = line * lineHeight + 10;
    return y;
}

function spawnWord(item) {
  const span = document.createElement("span");
  span.classList.add("word");
  span.textContent = item.word;

  // 크기 설정 (점수 기반)
  const fontSize = Math.min(item.score / 2 + 10,48);
  const line = Math.floor(Math.random() *4);
  const lineHeight = container.offsetHeight / 4;
  const y = line * lineHeight + (lineHeight - fontSize) / 2;

  // 위치 설정 (위쪽 랜덤 y 위치)
  span.style.top = y + "px";
  span.style.fontSize = fontSize + "px";
  // 속도 다양화
  const duration = random(15, 30);
  span.style.animation = `drift ${duration}s linear forwards`;

  container.appendChild(span);

  // 흐름 끝나면 제거
  setTimeout(() => {
    container.removeChild(span);
  }, duration * 1000);
}

let queue = [...keywords];
let intervalId = setInterval(() => {
    if (queue.length === 0) {
        clearInterval(intervalId);
        document.getElementById("intro-screen").style.display = "none";
        document.getElementById("word-flow-container").style.display = "none";
        document.getElementById("main-content").style.display = "block";
        console.log("모든 단어가 한 번씩 나왔습니다.");
        return;
    }
    const next = queue.shift();
    spawnWord(next);
},500);
// 주기적으로 단어 흐르게 만들기



// 올해 경과 퍼센트 출력 (진입페이지)
function getYearProgress() {
    const now = new Date();
    const start = new Date(now.getFullYear(),0,1);
    const end = new Date(now.getFullYear()+1,0,1);
    const percent = ((now - start) / (end - start)) * 100;
    return percent.toFixed(1);

}

document.getElementById("year-progress-text").textContent =
  `2025년은 ${getYearProgress()}% 지났습니다.`;
