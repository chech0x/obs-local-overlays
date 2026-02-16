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

generateBtn.addEventListener("click", async () => {
  const response = await fetch("/api/hash");
  const data = await response.json();
  const next = new URL(window.location.href);
  next.searchParams.set("pass", data.pass);
  window.location.assign(next.toString());
});

[overlayLinkInput, controllerLinkInput].forEach((input) => {
  input.addEventListener("click", () => {
    input.select();
    navigator.clipboard?.writeText(input.value).catch(() => {});
  });
});
