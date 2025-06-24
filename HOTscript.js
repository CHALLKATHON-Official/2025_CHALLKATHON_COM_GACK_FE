const keywords = [
  { word: "AI", score: 90, period: "25-1", category: "technology" },
  { word: "저출산", score: 80, period: "24-4", category: "social" },
  { word: "인플레이션", score: 70, period: "24-4", category: "economy" },
  { word: "K-POP", score: 90, period: "25-1", category: "entertainment" },
  { word: "친환경", score: 60, period: "24-3", category: "environment" },
  { word: "우주", score: 70, period: "24-3", category: "science" },
  { word: "디지털노마드", score: 50, period: "25-2", category: "social" },
  { word: "로봇", score: 30, period: "24-4", category: "technology" },
  { word: "ESG", score: 60, period: "24-3", category: "economy" },
  { word: "메타버스", score: 70, period: "24-3", category: "technology" },
  { word: "탄소중립", score: 60, period: "25-1", category: "environment" },
  { word: "빅데이터", score: 80, period: "25-2", category: "technology" },
  { word: "챗GPT", score: 100, period: "25-1", category: "technology" },
  { word: "제로웨이스트", score: 60, period: "24-3", category: "environment" },
  { word: "헬스케어", score: 70, period: "24-4", category: "health" },
  { word: "자율주행", score: 80, period: "25-2", category: "technology" },
  { word: "청년정책", score: 50, period: "24-4", category: "politics" },
  { word: "비대면", score: 60, period: "24-3", category: "social" },
  { word: "사이버보안", score: 70, period: "25-1", category: "technology" },
  { word: "기후위기", score: 60, period: "24-4", category: "environment" },
  { word: "양자컴퓨팅", score: 80, period: "25-2", category: "technology" },
  { word: "증강현실", score: 70, period: "24-3", category: "technology" },
  { word: "모빌리티", score: 60, period: "25-1", category: "technology" },
  { word: "스마트팜", score: 50, period: "24-4", category: "technology" },
  { word: "인공위성", score: 70, period: "24-3", category: "science" },
  { word: "기초과학", score: 60, period: "24-4", category: "science" },
  { word: "기후모델", score: 80, period: "25-2", category: "science" },
  { word: "전기차보조금", score: 80, period: "25-1", category: "economy" },
  { word: "가계부채", score: 70, period: "24-4", category: "economy" },
  { word: "리쇼어링", score: 60, period: "24-3", category: "economy" },
  { word: "플라스틱세", score: 60, period: "24-3", category: "environment" },
  { word: "생분해소재", score: 50, period: "25-1", category: "environment" },
  { word: "미세먼지", score: 70, period: "25-2", category: "environment" },
  { word: "고령화사회", score: 70, period: "24-4", category: "social" },
  { word: "청년실업", score: 60, period: "25-2", category: "social" },
  { word: "지역균형", score: 50, period: "24-3", category: "social" },
  { word: "총선", score: 90, period: "24-4", category: "politics" },
  { word: "외교정책", score: 60, period: "25-1", category: "politics" },
  { word: "정신건강", score: 60, period: "25-2", category: "health" },
  { word: "OTT콘텐츠", score: 90, period: "24-4", category: "entertainment" },
  { word: "아이돌데뷔", score: 70, period: "25-2", category: "entertainment" },
  { word: "K-드라마", score: 80, period: "25-1", category: "entertainment" },
  { word: "음원차트", score: 60, period: "24-4", category: "entertainment" },
  { word: "넷플릭스오리지널", score: 90, period: "24-3", category: "entertainment" },
  { word: "버추얼유튜버", score: 50, period: "25-2", category: "entertainment" }

];


let selectedPeriod = "25-2";
let selectedCategory = "all";

const container = document.getElementById("word-flow-container");
const lines = 15;
let usedLines = new Set();
let currentFlowInterval = null;

function random(min, max) {
  return Math.random() * (max - min) + min;
}

//percentbar 관련 함수모음
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

// progress bar 와 word flow가 동시에 사라지도록
function startWordFlow() {
  const filtered = getFilteredKeywords();
  const lineHeight = container.offsetHeight / lines;
  let queue = [...filtered];
  currentFlowInterval = setInterval(() => {
    if (queue.length === 0) {
      queue = [...filtered];
    }
    const next = queue.shift();
    spawnWord(next,lineHeight);
  },300);
}
//flow 재시작
function restartWordFlow() {
  clearInterval(currentFlowInterval);
  document.querySelectorAll(".word").forEach(el =>el.remove());
  startWordFlow();
}

//word-flow-container 설정
function getAvailableY(fontSize, lineHeight) {
  if (usedLines.size >= lines) usedLines.clear(); //usedLines : 현재 프레임에서 이미 사용된 라인 번호를 저장하는 Set
  let line;
  do { //아직 사용되지 않은 라인 랜덤으로 고르기
    line = Math.floor(Math.random() * lines);
  } while (usedLines.has(line));
  usedLines.add(line); //이미 사용된 라인이라면 다시 뽑기
  return line * lineHeight + (lineHeight - fontSize)/2; //선택된 라인에 맞춰서 y축 좌표 계산, +10으로 word가 상단에 붙지 않도록 함
}
function spawnWord(item, lineHeight,isLast = false) {
  const span = document.createElement("span"); //새로운 span 요소를 만들고 텍스트로 단어를 설정한 다음 word클래스 붙이기
  span.classList.add("word");
  span.textContent = item.word;

  // 크기 설정 (점수 기반)
  const fontSize = Math.min(item.score / 2 + 10,lineHeight-4); //word의 score에 맞춰 글씨 크기 설정 (lineheight보다는 작게)
  const y = getAvailableY(fontSize,lineHeight);

  // 위치 설정 (위쪽 랜덤 y 위치)
  span.style.top = y + "px";
  span.style.fontSize = fontSize + "px";
  // 속도 고정
  const duration = 20; // 숫자가 높을수록 느리다
  span.style.animation = `drift ${duration}s linear forwards`;

  container.appendChild(span); //단어 화면에 추가하기

  // 흐름 끝나면 제거
  setTimeout(() => {
    container.removeChild(span);
  }, duration * 1000);

  return duration; //지속시간 반환
}

//필터링 함수 작성
function getFilteredKeywords() {
  return keywords.filter(item => {
    const matchPeriod = selectedPeriod === "all" || item.period === selectedPeriod;
    const matchCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchPeriod && matchCategory;
  })
}
//선택 태그 반영 함수
function setPeriod(period) {
  selectedPeriod = period;
  restartWordFlow();
}
function setCategory(category) {
  selectedCategory = category;
  restartWordFlow();
}

//작동
const final = getYearProgress();
animateProgressBar(final);

setTimeout(() => { // 올해의 경과율이 멈추면 그때 단어생성
  document.getElementById("intro-screen").style.display = "none";
  document.getElementById("main-content").style.display = "block";
  startWordFlow();
}, 10000); //화면 전환하려면 숫자 변경





