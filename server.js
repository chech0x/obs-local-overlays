const crypto = require("crypto");
const os = require("os");
const path = require("path");
const express = require("express");
const http = require("http");
const mdns = require("multicast-dns");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const BIND_HOST = process.env.BIND_HOST || "0.0.0.0";
const MDNS_HOSTNAME = (process.env.MDNS_HOSTNAME || "overlays.local").replace(/\.$/, "");

function getLanIPv4(bindHost) {
  if (bindHost && bindHost !== "0.0.0.0" && bindHost !== "::") {
    return bindHost;
  }

  const interfaces = os.networkInterfaces();
  for (const list of Object.values(interfaces)) {
    for (const iface of list || []) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "127.0.0.1";
}

const lanIp = getLanIPv4(BIND_HOST);
const mdnsServer = mdns();

mdnsServer.on("query", (query) => {
  const wantsHost = query.questions.some(
    (q) => q.name === MDNS_HOSTNAME && (q.type === "A" || q.type === "ANY")
  );

  if (!wantsHost) {
    return;
  }

  mdnsServer.respond({
    answers: [
      {
        name: MDNS_HOSTNAME,
        type: "A",
        ttl: 120,
        data: lanIp,
      },
    ],
  });
});

app.use("/vendor/gsap", express.static(path.join(__dirname, "node_modules/gsap/dist")));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/controller", (_req, res) => {
  res.sendFile(path.join(__dirname, "public/controller.html"));
});

app.get("/overlay", (_req, res) => {
  res.sendFile(path.join(__dirname, "public/overlay.html"));
});

app.get("/api/hash", (_req, res) => {
  const pass = crypto.randomBytes(6).toString("hex");
  res.json({ pass });
});

io.on("connection", (socket) => {
  socket.on("join-room", ({ pass, role }) => {
    if (!pass || typeof pass !== "string") {
      return;
    }

    socket.join(pass);
    socket.data.pass = pass;
    socket.data.role = role;
  });

  socket.on("controller-show", (payload) => {
    const pass = socket.data.pass;
    if (!pass || socket.data.role !== "controller") {
      return;
    }

    const message = typeof payload?.message === "string" ? payload.message.trim() : "";
    const position = payload?.position;
    const requestedFontSize = Number.parseInt(payload?.fontSize, 10);
    const fontSize = Number.isFinite(requestedFontSize)
      ? Math.min(160, Math.max(36, requestedFontSize))
      : 68;

    io.to(pass).emit("overlay-show", {
      message: message || " ",
      position: ["top", "middle", "bottom"].includes(position) ? position : "middle",
      fontSize,
    });
  });

  socket.on("controller-hide", () => {
    const pass = socket.data.pass;
    if (!pass || socket.data.role !== "controller") {
      return;
    }

    io.to(pass).emit("overlay-hide");
  });
});

server.listen(PORT, BIND_HOST, () => {
  console.log(`Overlay server running on http://${BIND_HOST}:${PORT}`);
  console.log(`LAN access: http://${lanIp}:${PORT}`);
  console.log(`mDNS hostname: http://${MDNS_HOSTNAME}:${PORT}`);
});

function shutdown() {
  mdnsServer.destroy();
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
