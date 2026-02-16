const params = new URLSearchParams(window.location.search);
const pass = params.get("pass");

if (!pass) {
  window.location.replace("/");
}

const socket = io();
socket.emit("join-room", { pass, role: "overlay" });

const overlayRoot = document.getElementById("overlay-root");
const overlayBox = document.getElementById("overlay-box");
const overlayText = document.getElementById("overlay-text");

const positionClassByKey = {
  top: "pos-top",
  middle: "pos-middle",
  bottom: "pos-bottom",
};

function setPosition(position) {
  overlayBox.classList.remove("pos-top", "pos-middle", "pos-bottom");
  overlayBox.classList.add(positionClassByKey[position] || "pos-middle");
}

let isVisible = false;

socket.on("overlay-show", ({ message, position, fontSize }) => {
  overlayText.textContent = message || " ";
  overlayText.style.fontSize = `${Number.isFinite(fontSize) ? fontSize : 68}px`;
  setPosition(position);
  overlayRoot.classList.remove("hidden");

  if (!isVisible) {
    gsap.fromTo(
      overlayBox,
      { y: 48, opacity: 0, scale: 0.94 },
      { y: 0, opacity: 1, scale: 1, duration: 0.52, ease: "bounce.out" }
    );
  }

  isVisible = true;
});

socket.on("overlay-hide", () => {
  if (!isVisible) {
    return;
  }

  gsap.to(overlayBox, {
    opacity: 0,
    y: 20,
    duration: 0.2,
    ease: "power2.in",
    onComplete: () => {
      overlayRoot.classList.add("hidden");
      gsap.set(overlayBox, { clearProps: "all" });
    },
  });

  isVisible = false;
});
