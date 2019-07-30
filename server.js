const express = require("express");
const morgan = require("morgan");
const fs = require("fs");
const WebSocket = require("ws");

const app = express();

app.use(morgan("combined"));
app.use(express.static("./build"));

const port = process.env.PORT || 4000;
const wssport = process.env.WSSPORT || 8080; // web socket server port

app.get("/api/dirs/:path", (req, res) => res.json({ files: ["a", "b"] }));
app.get("/api/files", getFilesResp);
app.get("/api/pwd", (req, res) => res.json({ pwd: process.cwd() }));
app.get("/api/back", (req, res) => changeDir(req, res, "../"));
app.get("/api/chdir/:dir", (req, res) => changeDir(req, res, req.params.dir));
app.get("/api/process-images", processImages);
app.get("/", (req, res) => res.send("Api server. All routes at API!"));

const wss = new WebSocket.Server({ port: wssport });
let wsConnection;
wss.on("connection", function connection(ws) {
  console.log(`Web socket server listening on port ${wssport}!`);
  ws.on("message", m => console.log(`wss message`, m));
});
const appState = { image: { processing: false } };
app.listen(port, () => console.log(`Http server listening on port ${port}!`));

function changeDir(_, res, dir) {
  if (!fs.existsSync(dir))
    return res.status(410).json({
      error: `Eraaror! Failed finding ${dir} in ${process.cwd()}.`,
      pwd: process.cwd()
    });
  process.chdir(dir);
  res.json({ pwd: process.cwd() });
}

function getFilesResp(_, res) {
  getFiles(process.cwd())
    .then(files => res.json(files))
    .catch(error => res.json(error));
}

function getFiles(path) {
  return new Promise((resolve, reject) => {
    try {
      const filesUn = fs.readdirSync(path).reduce((acc, name) => {
        const stats = fs.lstatSync(name);
        const isDirectory = stats.isDirectory();
        return [...acc, { name, isDirectory, ino: stats.ino }];
      }, []);
      const files = filesUn.sort((a, b) =>
        a.isDirectory === b.isDirectory
          ? 0
          : a.isDirectory && !b.isDirectory
          ? -1
          : 1
      );
      resolve({ files });
    } catch (e) {
      reject({ error: `Failed, reading ${path} with ${e.message}` });
    }
  });
}

function wsProgress(status) {
  wss.clients.forEach(
    client =>
      client !== wsConnection &&
      client.readyState === WebSocket.OPEN &&
      client.send(JSON.stringify(status))
  );
}

function processImages(_, res) {
  if (appState.image.processing)
    return res
      .status(410)
      .json({ error: "Currently running another process." });
  appState.image = { processing: true, last: 6, current: 0 };
  appState.interval = setInterval(() => {
    if (appState.image.current >= appState.image.last) {
      appState.image = { processing: false, last: 0, current: 0 };
      clearInterval(appState.interval);
    } else appState.image.current++;
    wsProgress(appState.image);
  }, 500);
  return res.json({ status: "Images are being processed." });
}
