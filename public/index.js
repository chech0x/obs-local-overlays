const noPassSection = document.getElementById("no-pass");
const withPassSection = document.getElementById("with-pass");
const passLabel = document.getElementById("pass-label");
const overlayLinkInput = document.getElementById("overlay-link");
const controllerLinkInput = document.getElementById("controller-link");
const generateBtn = document.getElementById("generate-btn");

const params = new URLSearchParams(window.location.search);
const pass = params.get("pass");

function showLinks(activePass) {
  const overlayUrl = `${window.location.origin}/overlay?pass=${encodeURIComponent(activePass)}`;
  const controllerUrl = `${window.location.origin}/controller?pass=${encodeURIComponent(activePass)}`;

  passLabel.textContent = activePass;
  overlayLinkInput.value = overlayUrl;
  controllerLinkInput.value = controllerUrl;

  noPassSection.classList.add("hidden");
  withPassSection.classList.remove("hidden");
}

if (pass) {
  showLinks(pass);
}

async function copyText(text) {
  if (!text) {
    return false;
  }

  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_error) {
      // Continue with fallback for browsers/devices that block Clipboard API.
    }
  }

  const helper = document.createElement("textarea");
  helper.value = text;
  helper.setAttribute("readonly", "");
  helper.style.position = "fixed";
  helper.style.top = "0";
  helper.style.left = "-9999px";
  helper.style.opacity = "0";
  document.body.appendChild(helper);

  helper.focus();
  helper.select();
  helper.setSelectionRange(0, helper.value.length);

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch (_error) {
    copied = false;
  }

  document.body.removeChild(helper);
  return copied;
}

function showCopyFeedback(button, copied) {
  const label = copied ? "Copiado" : "Error";
  button.setAttribute("data-tip", label);
  button.classList.add("show-tip");
  clearTimeout(button._tipTimeout);
  button._tipTimeout = setTimeout(() => {
    button.classList.remove("show-tip");
  }, 1100);
}

generateBtn.addEventListener("click", async () => {
  const response = await fetch("/api/hash");
  const data = await response.json();
  const next = new URL(window.location.href);
  next.searchParams.set("pass", data.pass);
  window.location.assign(next.toString());
});

[overlayLinkInput, controllerLinkInput].forEach((input) => {
  input.addEventListener("click", async () => {
    input.select();
    await copyText(input.value);
  });
});

document.querySelectorAll(".copy-btn").forEach((button) => {
  button.addEventListener("click", async () => {
    const targetId = button.getAttribute("data-copy-target");
    const input = document.getElementById(targetId);
    if (!input) {
      return;
    }
    input.select();
    const copied = await copyText(input.value);
    showCopyFeedback(button, copied);
  });
});
