const params = new URLSearchParams(window.location.search);
const pass = params.get("pass");

if (!pass) {
  window.location.replace("/");
}

const socket = io();
socket.emit("join-room", { pass, role: "overlay" });

const overlayBox = document.getElementById("overlay-box");
const overlayText = document.getElementById("overlay-text");
const counterBox = document.getElementById("counter-box");
const counterText = document.getElementById("counter-text");

const positionClassByKey = {
  top: "pos-top",
  middle: "pos-middle",
  bottom: "pos-bottom",
};

function setPosition(position) {
  overlayBox.classList.remove("pos-top", "pos-middle", "pos-bottom");
  overlayBox.classList.add(positionClassByKey[position] || "pos-middle");
}

let isMessageVisible = false;
let counterSeconds = 0;
let counterInterval = null;

function renderCounter() {
  const minutes = String(Math.floor(counterSeconds / 60)).padStart(2, "0");
  const seconds = String(counterSeconds % 60).padStart(2, "0");
  counterText.textContent = `${minutes}:${seconds}`;
}

function setCounterFontSize(fontSize) {
  const size = Number.isFinite(fontSize) ? Math.min(320, Math.max(24, fontSize)) : 96;
  counterText.style.fontSize = `${size}px`;
}

function startCounter() {
  counterBox.classList.remove("hidden");
  if (counterInterval) {
    return;
  }

  counterInterval = setInterval(() => {
    counterSeconds += 1;
    renderCounter();
  }, 1000);
}

function stopCounter() {
  if (counterInterval) {
    clearInterval(counterInterval);
    counterInterval = null;
  }
  counterBox.classList.add("hidden");
}

renderCounter();

socket.on("overlay-show", ({ message, position, fontSize }) => {
  overlayText.textContent = message || " ";
  overlayText.style.fontSize = `${Number.isFinite(fontSize) ? fontSize : 68}px`;
  setPosition(position);
  overlayBox.classList.remove("hidden");

  if (!isMessageVisible) {
    gsap.fromTo(
      overlayBox,
      { y: 48, opacity: 0, scale: 0.94 },
      { y: 0, opacity: 1, scale: 1, duration: 0.52, ease: "bounce.out" }
    );
  }

  isMessageVisible = true;
});

socket.on("overlay-hide", () => {
  if (!isMessageVisible) {
    return;
  }

  gsap.to(overlayBox, {
    opacity: 0,
    y: 20,
    duration: 0.2,
    ease: "power2.in",
    onComplete: () => {
      overlayBox.classList.add("hidden");
      gsap.set(overlayBox, { clearProps: "opacity,transform" });
    },
  });

  isMessageVisible = false;
});

socket.on("counter-toggle", ({ running }) => {
  if (running) {
    startCounter();
    return;
  }
  stopCounter();
});

socket.on("counter-reset", () => {
  counterSeconds = 0;
  renderCounter();
});

socket.on("counter-size", ({ fontSize }) => {
  setCounterFontSize(fontSize);
});
