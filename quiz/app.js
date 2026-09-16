const CHOICE_LETTERS = "ABCDEFGHIJKLMNO";

const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const studyScreen = document.getElementById("study-screen");
const resultScreen = document.getElementById("result-screen");
const examTitle = document.getElementById("exam-title");
const poolNote = document.getElementById("pool-note");
const examButtons = document.getElementById("exam-buttons");
const studyButtons = document.getElementById("study-buttons");
const progressLabel = document.getElementById("progress-label");
const dots = document.getElementById("dots");
const player = document.getElementById("player");
const playBtn = document.getElementById("play-btn");
const replayBtn = document.getElementById("replay-btn");
const newExcerptBtn = document.getElementById("new-excerpt-btn");
const meterFill = document.getElementById("meter-fill");
const timeLabel = document.getElementById("time-label");
const choiceList = document.getElementById("choice-list");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const submitBtn = document.getElementById("submit-btn");
const scoreLine = document.getElementById("score-line");
const scoreSub = document.getElementById("score-sub");
const reviewList = document.getElementById("review-list");
const retakeBtn = document.getElementById("retake-btn");
const homeBtn = document.getElementById("home-btn");
const studyProgressLabel = document.getElementById("study-progress-label");
const studyPlayBtn = document.getElementById("study-play-btn");
const studyRestartBtn = document.getElementById("study-restart-btn");
const studyNextBtn = document.getElementById("study-next-btn");
const studyMeterFill = document.getElementById("study-meter-fill");
const studyTimeLabel = document.getElementById("study-time-label");
const studyPrompt = document.getElementById("study-prompt");
const studyRevealBtn = document.getElementById("study-reveal-btn");
const studyCard = document.getElementById("study-card");
const studyTitle = document.getElementById("study-title");
const studyArtist = document.getElementById("study-artist");
const studyPrevBtn = document.getElementById("study-prev-btn");
const studyHomeBtn = document.getElementById("study-home-btn");
const studyShuffleBtn = document.getElementById("study-shuffle-btn");

let catalog = null;
let activeExam = null;
let activeMode = null;
let questions = [];
let roundChoices = [];
let currentIndex = 0;
let excerptSeconds = 60;
let pointsPerQuestion = 2;
let choiceCount = 15;
let studyOrder = [];
let studyPosition = 0;
let studyRevealed = false;
let studyPendingPlay = false;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function shuffle(items) {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

function sample(items, count) {
  return shuffle(items).slice(0, Math.min(count, items.length));
}

function repoBase() {
  const path = window.location.pathname;
  const quizAt = path.indexOf("/quiz");
  if (quizAt === -1) return "";
  return path.slice(0, quizAt);
}

function audioUrl(exam, track) {
  const base = repoBase();
  const dir = exam.audioDir.replace(/^\/+/, "").replace(/\/$/, "");
  return `${base}/${dir}/${encodeURIComponent(track.file)}`;
}

function trackLabels(track) {
  return [track.title, track.artist];
}

function uniqueLabels(tracks) {
  const labels = [];
  const seen = new Set();
  for (const track of tracks) {
    for (const label of trackLabels(track)) {
      if (seen.has(label)) continue;
      seen.add(label);
      labels.push(label);
    }
  }
  return labels;
}

function sharedArtists(tracks) {
  const titlesByArtist = new Map();
  for (const track of tracks) {
    const titles = titlesByArtist.get(track.artist) || [];
    titles.push(track.title);
    titlesByArtist.set(track.artist, titles);
  }
  return [...titlesByArtist.entries()]
    .filter(([, titles]) => titles.length > 1)
    .map(([artist, titles]) => ({ artist, titles }));
}

function isCorrectLabel(track, label) {
  return track.title === label || track.artist === label;
}

function choiceByLetter(letter) {
  return roundChoices.find((choice) => choice.letter === letter);
}

function buildChoices(selectedTracks, allTracks, count) {
  const universe = uniqueLabels(allTracks);
  const chosen = new Set();
  for (const track of shuffle(selectedTracks)) {
    if (trackLabels(track).some((label) => chosen.has(label))) continue;
    const options = trackLabels(track);
    chosen.add(options[Math.floor(Math.random() * options.length)]);
  }
  for (const label of shuffle(universe.filter((label) => !chosen.has(label)))) {
    if (chosen.size >= count) break;
    chosen.add(label);
  }
  const letters = CHOICE_LETTERS.slice(0, count).split("");
  return shuffle([...chosen]).map((label, index) => ({
    letter: letters[index],
    label,
  }));
}

function pickExcerpt(duration, excerptLength) {
  if (!Number.isFinite(duration) || duration <= 0) {
    return { start: 0, length: excerptLength };
  }
  if (duration <= excerptLength) {
    return { start: 0, length: duration };
  }
  const maxStart = duration - excerptLength;
  return { start: Math.random() * maxStart, length: excerptLength };
}

function formatTime(seconds) {
  const safe = Math.max(0, seconds);
  const mins = Math.floor(safe / 60);
  const secs = Math.floor(safe % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function show(screen) {
  startScreen.classList.toggle("hidden", screen !== "start");
  quizScreen.classList.toggle("hidden", screen !== "quiz");
  studyScreen.classList.toggle("hidden", screen !== "study");
  resultScreen.classList.toggle("hidden", screen !== "result");
}

function currentStudyTrack() {
  return studyOrder[studyPosition];
}

function updateStudyReveal() {
  const track = currentStudyTrack();
  if (!track) return;
  studyPrompt.classList.toggle("hidden", studyRevealed);
  studyCard.classList.toggle("hidden", !studyRevealed);
  studyRevealBtn.textContent = studyRevealed ? "Hide answer" : "Show answer";
  studyRevealBtn.classList.toggle("ghost", studyRevealed);
  studyRevealBtn.classList.toggle("play", !studyRevealed);
  if (studyRevealed) {
    studyTitle.textContent = track.title;
    studyArtist.textContent = track.artist;
  }
}

function updateStudyProgress() {
  const duration = player.duration;
  if (!Number.isFinite(duration) || duration <= 0) return;
  const ratio = Math.min(1, Math.max(0, player.currentTime / duration));
  studyMeterFill.style.width = `${ratio * 100}%`;
  studyTimeLabel.textContent = `${formatTime(player.currentTime)} / ${formatTime(duration)}`;
}

function studyBeginPlayback() {
  player.play().then(() => {
    studyPlayBtn.textContent = "Pause";
  }).catch(() => {
    studyTimeLabel.textContent = "Click Play to start audio";
  });
}

function loadStudyTrack(autoPlay) {
  const track = currentStudyTrack();
  if (!track) return;
  studyRevealed = false;
  updateStudyReveal();
  studyProgressLabel.textContent = `Track ${studyPosition + 1} of ${studyOrder.length}`;
  studyPlayBtn.textContent = "Play";
  studyMeterFill.style.width = "0%";
  studyTimeLabel.textContent = "Loading track…";
  player.pause();
  player.src = audioUrl(activeExam, track);
  player.load();
  studyPendingPlay = autoPlay;
}

function startStudy(exam) {
  activeExam = exam;
  activeMode = "study";
  studyOrder = shuffle(exam.tracks.slice());
  studyPosition = 0;
  examTitle.textContent = `${exam.title} — Study`;
  show("study");
  loadStudyTrack(true);
}

function nextStudyTrack() {
  studyPosition += 1;
  if (studyPosition >= studyOrder.length) {
    studyOrder = shuffle(activeExam.tracks.slice());
    studyPosition = 0;
  }
  loadStudyTrack(true);
}

function prevStudyTrack() {
  if (studyPosition === 0) return;
  studyPosition -= 1;
  loadStudyTrack(false);
}

function reshuffleStudyDeck() {
  studyOrder = shuffle(activeExam.tracks.slice());
  studyPosition = 0;
  loadStudyTrack(false);
}

function ensureExcerpt(question) {
  const duration = player.duration;
  if (!Number.isFinite(duration) || duration <= 0) return;
  if (!question.excerpt) {
    question.excerpt = pickExcerpt(duration, excerptSeconds);
  }
}

function renderDots() {
  dots.replaceChildren();
  questions.forEach((item, index) => {
    const dot = el("li");
    if (index === currentIndex) dot.classList.add("current");
    if (item.selected) dot.classList.add("answered");
    dots.append(dot);
  });
}

function updateNav() {
  progressLabel.textContent = `Excerpt ${currentIndex + 1} of ${questions.length}`;
  renderDots();
  prevBtn.disabled = currentIndex === 0;
  nextBtn.disabled = currentIndex === questions.length - 1;
}

function syncChoiceInputs() {
  const selected = questions[currentIndex].selected;
  for (const input of choiceList.querySelectorAll("input")) {
    input.checked = input.value === selected;
  }
}

function stopIfPastExcerpt() {
  const question = questions[currentIndex];
  if (!question || !question.excerpt) return;
  const { start, length } = question.excerpt;
  const elapsed = player.currentTime - start;
  const ratio = Math.min(1, Math.max(0, elapsed / length));
  meterFill.style.width = `${ratio * 100}%`;
  timeLabel.textContent = `${formatTime(Math.max(0, elapsed))} / ${formatTime(length)}`;
  if (player.currentTime >= start + length - 0.03) {
    player.pause();
    player.currentTime = start;
    playBtn.textContent = "Play excerpt";
    meterFill.style.width = "0%";
    timeLabel.textContent = `Excerpt ready · ${formatTime(length)}`;
  }
}

function loadQuestion() {
  const question = questions[currentIndex];
  updateNav();
  playBtn.textContent = "Play excerpt";
  meterFill.style.width = "0%";
  timeLabel.textContent = "Loading track…";
  player.pause();
  player.src = audioUrl(activeExam, question.track);
  player.load();
  syncChoiceInputs();
}

function renderChoices() {
  choiceList.replaceChildren();
  for (const choice of roundChoices) {
    const label = el("label", "choice");
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "answer";
    input.value = choice.letter;
    const text = el("span");
    const letter = el("span", "letter", `${choice.letter}.`);
    text.append(letter, ` ${choice.label}`);
    label.append(input, text);
    choiceList.append(label);
  }
}

function beginPlayback() {
  player.play().then(() => {
    playBtn.textContent = "Pause";
  }).catch(() => {
    timeLabel.textContent = "Click Play excerpt to start audio";
  });
}

function seekThenPlay(start) {
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    player.removeEventListener("seeked", finish);
    beginPlayback();
  };
  player.pause();
  if (Math.abs(player.currentTime - start) < 0.08) {
    finish();
    return;
  }
  player.addEventListener("seeked", finish);
  player.currentTime = start;
  setTimeout(() => {
    if (finished) return;
    player.currentTime = start;
    finish();
  }, 400);
}

function playExcerpt(restart) {
  const question = questions[currentIndex];
  if (!question) return;
  if (player.readyState < 1) {
    question.pendingPlay = Boolean(restart);
    return;
  }
  ensureExcerpt(question);
  if (!question.excerpt) {
    question.pendingPlay = Boolean(restart);
    return;
  }
  question.pendingPlay = null;
  if (restart) {
    seekThenPlay(question.excerpt.start);
    return;
  }
  beginPlayback();
}

function startQuiz(exam) {
  activeExam = exam;
  activeMode = "quiz";
  excerptSeconds = catalog.excerptSeconds || 60;
  pointsPerQuestion = catalog.pointsPerQuestion || 2;
  choiceCount = catalog.choiceCount || 15;
  const count = catalog.questionCount || 10;
  const tracks = sample(exam.tracks, count);
  questions = tracks.map((track) => ({
    track,
    selected: null,
    excerpt: null,
  }));
  roundChoices = buildChoices(tracks, exam.tracks, choiceCount);
  currentIndex = 0;
  examTitle.textContent = exam.title;
  renderChoices();
  show("quiz");
  loadQuestion();
}

function gradeQuiz() {
  player.pause();
  reviewList.replaceChildren();
  let correctCount = 0;
  questions.forEach((question, index) => {
    const picked = question.selected ? choiceByLetter(question.selected) : null;
    const correct = Boolean(picked && isCorrectLabel(question.track, picked.label));
    if (correct) correctCount += 1;
    const item = el("li");
    const mark = el("p", correct ? "mark" : "mark miss", `${index + 1}. ${correct ? "Correct" : "Incorrect"}`);
    const yours = el("p", null, `Your answer: ${picked ? `${picked.letter}. ${picked.label}` : "No answer"}`);
    const right = el(
      "p",
      null,
      `Valid: ${question.track.title} or ${question.track.artist}`,
    );
    const how = el(
      "p",
      "muted",
      correct
        ? `Counted as ${picked.label === question.track.artist ? "artist" : "title"}`
        : "Title or billed artist both count",
    );
    item.append(mark, yours, right, how);
    reviewList.append(item);
  });
  const score = correctCount * pointsPerQuestion;
  const total = questions.length * pointsPerQuestion;
  scoreLine.textContent = `${score} / ${total}`;
  scoreSub.textContent = `${correctCount} of ${questions.length} excerpts correct`;
  show("result");
}

function renderStart() {
  player.pause();
  activeMode = null;
  const exam = catalog.exams[0];
  const labels = uniqueLabels(exam.tracks);
  const shared = sharedArtists(exam.tracks);
  const sharedNote = shared
    .map((item) => `${item.artist} (${item.titles.join(", ")})`)
    .join("; ");
  poolNote.textContent = `${exam.tracks.length} tracks · ${labels.length} unique title/artist labels. Quiz samples ${catalog.questionCount} excerpts and ${catalog.choiceCount} choices. Study mode plays full tracks in random order. Shared artists: ${sharedNote}.`;
  examButtons.replaceChildren();
  studyButtons.replaceChildren();
  for (const item of catalog.exams) {
    const quizBtn = el("button", "play", `Quiz — ${item.title}`);
    quizBtn.type = "button";
    quizBtn.dataset.exam = item.id;
    quizBtn.dataset.mode = "quiz";
    examButtons.append(quizBtn);

    const studyBtn = el("button", "ghost", `Study — ${item.title}`);
    studyBtn.type = "button";
    studyBtn.dataset.exam = item.id;
    studyBtn.dataset.mode = "study";
    studyButtons.append(studyBtn);
  }
  examTitle.textContent = "Listening quiz";
  show("start");
}

player.addEventListener("loadedmetadata", () => {
  if (activeMode === "study") {
    player.currentTime = 0;
    studyTimeLabel.textContent = `0:00 / ${formatTime(player.duration)}`;
    if (studyPendingPlay) {
      studyPendingPlay = false;
      studyBeginPlayback();
    }
    return;
  }
  if (activeMode !== "quiz") return;
  const question = questions[currentIndex];
  if (!question) return;
  ensureExcerpt(question);
  if (!question.excerpt) return;
  player.currentTime = question.excerpt.start;
  timeLabel.textContent = `Excerpt ready · ${formatTime(question.excerpt.length)} · starts ${formatTime(question.excerpt.start)}`;
  if (question.pendingPlay != null) {
    const restart = question.pendingPlay;
    question.pendingPlay = null;
    playExcerpt(restart);
  }
});

player.addEventListener("timeupdate", () => {
  if (activeMode === "study") {
    updateStudyProgress();
    return;
  }
  if (activeMode === "quiz") stopIfPastExcerpt();
});

player.addEventListener("pause", () => {
  if (activeMode === "study" && studyPlayBtn.textContent === "Pause") {
    studyPlayBtn.textContent = "Play";
  }
  if (activeMode === "quiz" && playBtn.textContent === "Pause") {
    playBtn.textContent = "Play excerpt";
  }
});

player.addEventListener("ended", () => {
  if (activeMode !== "study") return;
  studyPlayBtn.textContent = "Play";
  studyMeterFill.style.width = "100%";
});

playBtn.addEventListener("click", () => {
  if (!player.paused) {
    player.pause();
    playBtn.textContent = "Play excerpt";
    return;
  }
  const question = questions[currentIndex];
  ensureExcerpt(question);
  const excerpt = question.excerpt;
  const inWindow = Boolean(
    excerpt &&
      player.currentTime >= excerpt.start &&
      player.currentTime < excerpt.start + excerpt.length - 0.05,
  );
  playExcerpt(!inWindow);
});

replayBtn.addEventListener("click", () => playExcerpt(true));
newExcerptBtn.addEventListener("click", () => {
  const question = questions[currentIndex];
  if (!Number.isFinite(player.duration) || player.duration <= 0) {
    question.excerpt = null;
    question.pendingPlay = true;
    return;
  }
  question.excerpt = pickExcerpt(player.duration, excerptSeconds);
  playExcerpt(true);
});

prevBtn.addEventListener("click", () => {
  if (currentIndex === 0) return;
  currentIndex -= 1;
  loadQuestion();
});

nextBtn.addEventListener("click", () => {
  if (currentIndex >= questions.length - 1) return;
  currentIndex += 1;
  loadQuestion();
});

choiceList.addEventListener("change", (event) => {
  if (!(event.target instanceof HTMLInputElement)) return;
  questions[currentIndex].selected = event.target.value;
  updateNav();
});

submitBtn.addEventListener("click", gradeQuiz);
retakeBtn.addEventListener("click", () => startQuiz(activeExam));
homeBtn.addEventListener("click", renderStart);

function handleExamButtonClick(event) {
  if (!(event.target instanceof HTMLButtonElement)) return;
  const exam = catalog.exams.find((item) => item.id === event.target.dataset.exam);
  if (!exam) return;
  if (event.target.dataset.mode === "study") startStudy(exam);
  else startQuiz(exam);
}

examButtons.addEventListener("click", handleExamButtonClick);
studyButtons.addEventListener("click", handleExamButtonClick);

studyPlayBtn.addEventListener("click", () => {
  if (!player.paused) {
    player.pause();
    studyPlayBtn.textContent = "Play";
    return;
  }
  if (player.currentTime >= player.duration - 0.05) {
    player.currentTime = 0;
  }
  studyBeginPlayback();
});

studyRestartBtn.addEventListener("click", () => {
  player.currentTime = 0;
  studyMeterFill.style.width = "0%";
  studyBeginPlayback();
});

studyNextBtn.addEventListener("click", () => nextStudyTrack());
studyPrevBtn.addEventListener("click", () => prevStudyTrack());
studyShuffleBtn.addEventListener("click", () => reshuffleStudyDeck());
studyHomeBtn.addEventListener("click", () => renderStart());
studyRevealBtn.addEventListener("click", () => {
  studyRevealed = !studyRevealed;
  updateStudyReveal();
});

document.addEventListener("keydown", (event) => {
  if (!studyScreen.classList.contains("hidden")) {
    const key = event.key.toUpperCase();
    if (event.code === "Space") {
      if (event.target instanceof HTMLButtonElement || event.target instanceof HTMLInputElement) return;
      event.preventDefault();
      studyPlayBtn.click();
    } else if (key === "S") {
      studyRevealBtn.click();
    } else if (key === "N") {
      studyNextBtn.click();
    } else if (event.key === "ArrowLeft") {
      studyPrevBtn.click();
    } else if (event.key === "ArrowRight") {
      studyNextBtn.click();
    }
    return;
  }
  if (quizScreen.classList.contains("hidden")) return;
  const key = event.key.toUpperCase();
  if (key.length === 1 && key >= "A" && key <= "O") {
    const input = choiceList.querySelector(`input[value="${key}"]`);
    if (input) {
      input.checked = true;
      questions[currentIndex].selected = key;
      updateNav();
    }
    return;
  }
  if (event.code === "Space") {
    if (event.target instanceof HTMLButtonElement || event.target instanceof HTMLInputElement) return;
    event.preventDefault();
    playBtn.click();
  } else if (key === "R") {
    replayBtn.click();
  } else if (key === "N") {
    newExcerptBtn.click();
  } else if (event.key === "ArrowLeft") {
    prevBtn.click();
  } else if (event.key === "ArrowRight") {
    nextBtn.click();
  }
});

fetch("./catalog.json")
  .then((response) => {
    if (!response.ok) throw new Error("Could not load catalog.json");
    return response.json();
  })
  .then((data) => {
    catalog = data;
    renderStart();
  })
  .catch((error) => {
    poolNote.textContent = error.message;
  });
