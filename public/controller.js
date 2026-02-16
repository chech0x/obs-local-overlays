const params = new URLSearchParams(window.location.search);
const pass = params.get("pass");

if (!pass) {
  window.location.replace("/");
}

const socket = io();
socket.emit("join-room", { pass, role: "controller" });

const messageInput = document.getElementById("message");
const fontSizeInput = document.getElementById("font-size");
const fontSizeValue = document.getElementById("font-size-value");
const fontDownButton = document.getElementById("font-down");
const fontUpButton = document.getElementById("font-up");
const passView = document.getElementById("pass-view");
passView.textContent = pass;

let activePosition = null;

function getFontSize() {
  const parsed = Number.parseInt(fontSizeInput.value, 10);
  if (!Number.isFinite(parsed)) {
    return 68;
  }
  return Math.min(160, Math.max(36, parsed));
}

function renderFontSizeLabel() {
  fontSizeValue.textContent = `${getFontSize()} px`;
}

function sendShow(position) {
  activePosition = position;
  socket.emit("controller-show", {
    message: messageInput.value,
    position,
    fontSize: getFontSize(),
  });
}

function sendHide() {
  if (!activePosition) {
    return;
  }
  activePosition = null;
  socket.emit("controller-hide");
}

function setupHoldButton(button) {
  const position = button.dataset.position;
  const onPress = (event) => {
    event.preventDefault();
    sendShow(position);
    button.classList.add("is-holding");
  };
  const onRelease = () => {
    sendHide();
    button.classList.remove("is-holding");
  };

  button.addEventListener("mousedown", onPress);
  button.addEventListener("touchstart", onPress, { passive: false });
  button.addEventListener("mouseup", onRelease);
  button.addEventListener("mouseleave", onRelease);
  button.addEventListener("touchend", onRelease);
  button.addEventListener("touchcancel", onRelease);
}

document.querySelectorAll(".hold-btn").forEach(setupHoldButton);

document.addEventListener("mouseup", sendHide);
document.addEventListener("touchend", sendHide);

messageInput.addEventListener("input", () => {
  if (activePosition) {
    sendShow(activePosition);
  }
});

function adjustFont(delta) {
  const next = getFontSize() + delta;
  fontSizeInput.value = String(Math.min(160, Math.max(36, next)));
  renderFontSizeLabel();
  if (activePosition) {
    sendShow(activePosition);
  }
}

fontSizeInput.addEventListener("input", () => {
  renderFontSizeLabel();
  if (activePosition) {
    sendShow(activePosition);
  }
});

fontDownButton.addEventListener("click", () => adjustFont(-2));
fontUpButton.addEventListener("click", () => adjustFont(2));

renderFontSizeLabel();
