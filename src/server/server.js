const express = require("express");
const morgan = require("morgan");
const fs = require("fs");
const WebSocket = require("ws");
const path = require("path");

const images = require("./proc-imgs");
const routes = require("../common/routes");

const app = express();

app.use(morgan("combined"));
app.use(express.static("./build"));

const port = process.env.PORT || 4000;
const wssport = process.env.WSSPORT || 8080; // web socket server port

//process.chdir("/Users/carltonjoseph/dogs"); // debug test dir
process.chdir("/Users/carltonjoseph/dogs/resized/size_75x50"); // debug test dir

app.get(routes.files, getFilesResp);
app.get(routes.pwd, (_, res) => res.json({ pwd: process.cwd() }));
app.get(routes.back, (req, res) => chDir(req, res, "../"));
app.get(`${routes.chdir}/:dir`, (req, res) => chDir(req, res, req.params.dir));
app.get(routes.processImages, images.process(wsProgress));
app.get(routes.resetImages, images.reset);
app.get(`${routes.getImages}/:img`, (req, res) =>
  getImg(req, res, req.params.img)
);

const wss = new WebSocket.Server({ port: wssport });
let wsConnection;
wss.on("connection", function connection(ws) {
  console.log(`Web socket server listening on port ${wssport}!`);
  ws.on("message", m => console.log(`wss message`, m));
});
app.listen(port, () => console.log(`Http server listening on port ${port}!`));

function chDir(_, res, dir) {
  if (!fs.existsSync(dir))
    return res.status(410).json({
      error: `Error! Failed finding ${dir} in ${process.cwd()}.`,
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

function getImg(_, res, img) {
  res.sendFile(path.join(process.cwd(), img));
}
