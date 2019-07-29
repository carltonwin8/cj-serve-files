const express = require("express");
const morgan = require("morgan");
const fs = require("fs");

const app = express();

app.use(morgan("combined"));
app.use(express.static("./build"));

const port = process.env.PORT || 4000;

app.get("/api/dirs/:path", (req, res) => res.json({ files: ["a", "b"] }));
app.get("/api/files", getFilesResp);
app.get("/api/pwd", (req, res) => res.json({ pwd: process.cwd() }));
app.get("/api/back", (req, res) => changeDir(req, res, "../"));
app.get("/api/chdir/:dir", (req, res) => changeDir(req, res, req.params.dir));
app.get("/", (req, res) => res.send("Api server. All routes at API!"));

app.listen(port, () => console.log(`Server listening on port ${port}!`));

function changeDir(req, res, dir) {
  if (!fs.existsSync(dir))
    return res.status(410).json({
      error: `Error! Failed finding ${dir} in ${process.cwd()}.`,
      pwd: process.cwd()
    });
  process.chdir(dir);
  res.json({ pwd: process.cwd() });
}

function getFilesResp(req, res) {
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
