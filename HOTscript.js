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
let usedLines = new Set();

function random(min, max) {
  return Math.random() * (max - min) + min;
}

//percentbar 설정
function getYearProgress() {
  const now = new Date();
  const start = new Date(now.getFullYear(),0,1);
  const end = new Date(now.getFullYear()+ 1,0,1);
  const percent = ((now -start) /(end - start)) * 100;
  return percent.toFixed(1);
}
function animateProgressBar(finalPercent) {
  const bar = document.getElementById("progress-bar");
  const text = document.getElementById("progress-percent-text");
  let current = 0;

  const interval = setInterval(() => {
    if (current >= finalPercent) {
      clearInterval(interval);
    }
    else {
      current += 0.5;
      bar.style.width = `${current}%`;
      text.textContent =  `${new Date().getFullYear()}년은 ${current.toFixed(1)}% 지났습니다.`;
    }
  }, 20);
}

const final = getYearProgress();
animateProgressBar(final);

setTimeout(() => { // 올해의 경과율이 멈추면 그때 단어생성
  document.getElementById("word-flow-container").style.display = "block";
  startWordFlow();
}, 4000);

// progress bar 와 word flow가 동시에 사라지도록
function startWordFlow() {
  const lineHeight = container.offsetHeight / lines;
  let queue = [...keywords];
  let maxDuration =0;
  let intervalId = setInterval(() => {
      if (queue.length === 0) {
        queue = [...keywords]
      }
      const next = queue.shift();
      const duration = spawnWord(next,lineHeight);
      if (duration > maxDuration) {
        maxDuration = duration;
      }
  },300);
}
//word-flow-container 설정
function getAvailableY(fontSize, lineHeight) {
  if (usedLines.size >= lines) usedLines.clear(); //usedLines : 현재 프레임에서 이미 사용된 라인 번호를 저장하는 Set
  let line;
  do { //아직 사용되지 않은 라인 랜덤으로 고르기
    line = Math.floor(Math.random() * lines);
  } while (usedLines.has(line));
  usedLines.add(line); //이미 사용된 라인이라면 다시 뽑기
  return line * lineHeight + 10; //선택된 라인에 맞춰서 y축 좌표 계산, +10으로 word가 상단에 붙지 않도록 함
}

function spawnWord(item, lineHeight,isLast = false) {
  const span = document.createElement("span"); //새로운 span 요소를 만들고 텍스트로 단어를 설정한 다음 word클래스 붙이기
  span.classList.add("word");
  span.textContent = item.word;

  // 크기 설정 (점수 기반)
  const fontSize = Math.min(item.score / 2 + 10,48); //word의 score에 맞춰 글씨 크기 설정
  const y = getAvailableY(fontSize,lineHeight);

  // 위치 설정 (위쪽 랜덤 y 위치)
  span.style.top = y + "px";
  span.style.fontSize = fontSize + "px";
  // 속도 다양화
  const duration = isLast? 5 : random(15, 30);
  span.style.animation = `drift ${duration}s linear forwards`;

  container.appendChild(span); //단어 화면에 추가하기

  // 흐름 끝나면 제거
  setTimeout(() => {
    container.removeChild(span);
  }, duration * 1000);

  return duration; //지속시간 반환
}