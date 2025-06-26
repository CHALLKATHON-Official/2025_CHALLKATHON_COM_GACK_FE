let keywords = [];
let dataLoaded = false; // 데이터가 로딩되었는지 유무 판단

let selectedPeriod = "all"; //초기 기간,분야를 전체로 설정
let selectedCategory = "all";

const container = document.getElementById("word-flow-container");
const lines = 15;
let usedLines = new Set();
let currentFlowInterval = null;
let isPaused = false;
const wordTimestamps = new Map(); //단어가 정지된 시점 기록

function random(min, max) {
  return Math.random() * (max - min) + min;
}

//percentbar 관련 함수모음
// 연도의 경과율을 계산하는 함수
function getYearProgress() {
  const now = new Date(); // 현재 날짜와 시간 불러오기
  const start = new Date(now.getFullYear(),0,1); // 올해의 시작 (1월 1일)
  const end = new Date(now.getFullYear()+ 1,0,1); // 올해의 끝 = 내년 1월 1일
  const percent = ((now -start) /(end - start)) * 100; // 올해가 얼마나 지났는지 계산
  return percent.toFixed(2); // 소수점 둘째자리까지 반환
}
// 경과율을 보여주는 애니메이션 함수
function animateProgressBar(finalPercent) {
  const bar = document.getElementById("progress-bar"); // 경과율 바 요소
  const text = document.getElementById("progress-percent-text"); // 퍼센트 텍스트 요소
  let current = 0;
  const interval = setInterval(() => { // 40ms마다 0.5%씩 증가시켜 보여줌
    if (current >= finalPercent) { // 최근 퍼센트에 도달하면 정지
      clearInterval(interval);
    }
    else {
      current += 0.5;
      bar.style.width = `${current}%`; // 퍼센트만큼 바 길이 설정
      text.textContent =  `${new Date().getFullYear()}년은 ${current.toFixed(2)}% 지났습니다.`; //텍스트 표시
    }
  }, 40);
}

// word flow 관련 함수
function startWordFlow() {
  const filtered = getFilteredKeywords(); //선택된 기간과 분류에 맞게 필터링
  const lineHeight = container.offsetHeight / lines;
  let queue = [...filtered]; // 필터링된 단어들을 복사해서 큐 생성
  currentFlowInterval = setInterval(() => { // 0.25초 마다 단어 화면에 출력
    if (queue.length === 0) {
      queue = [...filtered]; //큐가 비면 다시 필터링된 단어들로 초기화
    }
    const next = queue.shift(); // 다음 단어 큐에서 가져오기
    spawnWord(next,lineHeight); // 단어 생성 함수 호출
  },250);
}
//flow 재시작함수
function restartWordFlow() {
  clearInterval(currentFlowInterval); // 기존 흐름 멈추기
  document.querySelectorAll(".word").forEach(el =>el.remove()); // 화면에 떠있는 단어들 제거
  startWordFlow(); // 새로운 flow 시작
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
function spawnWord(item, lineHeight) {
  const span = document.createElement("span"); //새로운 span 요소를 만들고 텍스트로 단어를 설정한 다음 word클래스 붙이기
  span.classList.add("word"); // 클래스 지정
  span.textContent = item.word; // 단어 텍스트 삽입

  // 크기 설정 (점수 기반)
  const fontSize = Math.min(item.score / 2 + 10,lineHeight-4); //word의 score에 맞춰 글씨 크기 설정 (lineheight보다는 작게)
  const y = getAvailableY(fontSize,lineHeight); //사용할 y축 좌표 계산
  const duration = 20000; // 숫자가 높을수록 느리다

  // 위치 설정
  span.style.top = y + "px"; // 수직 위치 지정
  span.style.fontSize = fontSize + "px"; // 글씨 크기 설정
  span.style.animation = `drift ${duration / 1000}s linear forwards`; // 왼쪽으로 이동하는 애니메이션
  span.style.animationPlayState = isPaused ? "paused" : "running"; // 정지 상태에 따라 애니메이션 제어

  const removeId = setTimeout(() => {
    if (span.parentElement) container.removeChild(span); // 일정 시간이 지나면 제거
  },duration);
  span.dataset.removeId = removeId; // 삭제 예약 ID 저장
  span.dataset.startTime = Date.now(); // 시작 시점 기록
  span.dataset.duration = duration; // 전체 애니메이션 시간 저장

  span.setAttribute("draggable","true"); // 드래그 가능 설정
  span.addEventListener("dragstart",e => {
    e.dataTransfer.setData("text/plain", item.word); // 드래그 시 단어 텍스트 전송
  });

  container.appendChild(span); //단어 화면에 추가하기
}

//필터링 함수 작성
function getFilteredKeywords() {
  return keywords.filter(item => {
    const matchPeriod = selectedPeriod === "all" || item.period === selectedPeriod;
    const matchCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchPeriod && matchCategory; // 필터링된 분류와 기간에 맞게 키워드 반환
  });
}
//선택 태그 반영 함수
function setPeriod(period) {
  selectedPeriod = period; // 선택한 기간으로 업데이트
  updateFilterStatus(); // 네비게이션에 현재 필터 상태 반영
  restartWordFlow(); // 필터 변경에 따라 재시작
}
function setCategory(category) {
  selectedCategory = category; // 선택한 카테고리로 업데이트
  updateFilterStatus(); // 네비게이션에 현재 필터 상태 반영
  restartWordFlow(); // 필터 변경에 따라 재시작
}
// 업데이트된 필터상태 표시
function updateFilterStatus() {
  const periodMap = {
    "all": "최근 3년",
    "2023": "2023년도",
    "2024": "2024년도",
    "2025": "2025년도",
  };
  const categoryMap = {
    "all": "전체",
    "technology": "기술",
    "science": "과학",
    "social": "사회",
    "health": "건강",
    "environment": "환경",
    "politics": "정치",
    "economy": "경제",
    "entertainment": "연예",
    "sports": "스포츠"
  };
  document.getElementById("filter-period").textContent = "📅 " + (periodMap[selectedPeriod] || "최근 3년"); // 선택된 기간 표시
  document.getElementById("filter-category").textContent = "🏷️ " + (categoryMap[selectedCategory] || "전체"); // 선택된 분류 표시
}

//정지, 재생 버튼
document.getElementById("toggle-flow-btn").addEventListener("click", () => {
  const button = document.getElementById("toggle-flow-btn");
  const words = document.querySelectorAll(".word");

  if (!isPaused) {
    words.forEach(word => {
      word.style.animationPlayState = "paused"; //css 애니메이션 멈춤
      clearTimeout(word.dataset.removeId); // 제거 예약 취소
      const elapsed = Date.now() - word.dataset.startTime; // 경과 시간 계산
      word.dataset.remaining = word.dataset.duration - elapsed; // 남은 시간 저장
    });
    clearInterval(currentFlowInterval); // 단어 생성 멈춤
    currentFlowInterval = null;
    button.textContent = "재생" // 버튼 텍스트 변경
    isPaused = true; // 상태 변경
  } else {
    words.forEach(word => {
      word.style.animationPlayState = "running"; // 애니메이션 재개
      const remaining = word.dataset.remaining || word.dataset.duration;
      const newId = setTimeout(() => {
        if (word.parentElement) container.removeChild(word);
      }, remaining); // 남은 시간 뒤에 제거 예약
      word.dataset.removeId = newId;
      word.dataset.startTime = Date.now();
      word.dataset.duration = remaining;
    });
    startWordFlow(); // 단어 생성 다시 시작
    button.textContent = "정지"; // 버튼 텍스트 변경
    isPaused = false; // 상태 변경
  }
});

// 드롭 타켓 이벤트
document.addEventListener('DOMContentLoaded', function () {
  const leftBox = document.querySelector('.drop-target-left');
  const rightBox = document.querySelector('.drop-target-right');

  function setupSearchDropEvent(target, searchBaseUrl) {
    target.addEventListener('dragover', e => e.preventDefault()); // 드롭 허용

    target.addEventListener('drop', e => {
      e.preventDefault();
      const keyword = e.dataTransfer.getData("text/plain"); // 드래그된 단어 가져오기
      if (keyword) {
        const encoded = encodeURIComponent(keyword);
        const fullUrl = `${searchBaseUrl}${encoded}`; // 검색 URL 생성
        window.open(fullUrl, '_blank'); // 새 창으로 검색
      }
    });
  }
  setupSearchDropEvent(leftBox, 'https://search.naver.com/search.naver?query='); // 왼쪽 → 네이버 검색
  setupSearchDropEvent(rightBox, 'https://www.google.com/search?q='); // 오른쪽 → 구글 검색
})

fetch("Hotwords.json") //json 파일 받아와서 keywords에 데이터 넣기, 로딩됬으면 true로 변경
  .then(response => response.json())
  .then(data => {
    keywords = data;
    dataLoaded = true;
  })
  .catch(error => console.error("키워드 JSON 로드 실패:",error));

document.addEventListener("DOMContentLoaded", () => {
  // 요소 참조
  const intro = document.getElementById("intro-screen"); // 인트로 화면
  const main = document.getElementById("main-content"); // 메인 콘텐츠
  const bottom = document.querySelector(".bottom-container"); // 하단 부분

  // 초기 상태 숨기기
  main.style.display = "block";
  bottom.style.display = "flex";

  // 연도 진행률 애니메이션 시작
  const final = getYearProgress();
  animateProgressBar(final);

  // 6초 후 인트로 종료 및 메인 진입
  setTimeout(() => {
    // intro → main 전환
    document.getElementById("intro-screen").style.display = "none";
    document.getElementById("main-content").style.display = "block";
    document.getElementsByClassName("bottom-container")[0].style.display = "block";
    isPaused = false;
    document.getElementById("toggle-flow-btn").textContent = "정지"
    const waitForData = setInterval(() => {
      if (dataLoaded) {
        clearInterval(waitForData);
        updateFilterStatus();
        restartWordFlow();
      }
    },100);
  }, 6000);
});

let relatedKeywordGroups =[]; //연관단어세트
let relatedInterval = null;
let relatedIndex = 0;

fetch("연관단어점수0625_2200.json") //연관단어세트 json 파일 불러오기
  .then(res => res.json())
  .then(data => {
    relatedKeywordGroups = data; // data 불러와서 저장
    startRelatedWordsRotation(); // 자동 순환 시작
  })
  .catch(err => console.error("연관 단어 JSON 로드 실패:", error));

function startRelatedWordsRotation() { // 연관 키워드 데이터가 없으면 함수 종료
  if (!relatedKeywordGroups.length) return;

  const list = document.getElementById("related-words-list"); // 연관 단어 목록을 표시할 <ul> 요소

  const update = () => { // 연관 단어 목록 갱신
    const group = relatedKeywordGroups[relatedIndex]; // 현재 인덱스에 해당하는 연관 단어 세트 가져오기
    list.innerHTML = ""; // 기존 목록 초기화

    for (let i = 1; i <= 5; i++) { // 1~5번까지 연관 단어와 점수를 표시
      const word = group[`연관단어${i}`];
      const score = group[`점수${i}`];
      if (word) {
        const li = document.createElement("li"); // 새로운 요소 생성
        li.textContent = `${word} (${score})`;
        list.appendChild(li); 
      }
    }

    relatedIndex = (relatedIndex + 1) % relatedKeywordGroups.length; //다음에 보여줄 인덱스 순환
  };

  update(); // 초기 표시
  relatedInterval = setInterval(update, 3000); // 이후 반복
}