const path = require("path");
const fs = require("fs-extra");
const { exec } = require("child_process");

const dcraw =
  process.platform === "darwin"
    ? "/usr/local/bin/dcraw"
    : process.platform === "win32"
    ? 'C:/"Program Files"/ImageMagick-7.0.8-Q16/dcraw'
    : "/usr/local/bin/convert";

const convert =
  process.platform === "darwin"
    ? "/usr/local/bin/convert"
    : process.platform === "win32"
    ? 'C:/"Program Files"/ImageMagick-7.0.8-Q16/magick convert'
    : "/usr/local/bin/convert";

const appState = {
  image: {
    error: null,
    processing: false,
    raw: { end: 0, current: { extracted: 0, resized: 0 } },
    jpeg: { end: 0, current: { resized: 0 } }
  }
};

const isProcessing = ({ raw, jpeg }) =>
  !(
    jpeg.end === jpeg.current.resized &&
    raw.end === raw.current.extracted &&
    raw.end === raw.current.resized
  );

const processImages = wsProgress => (_, res) => {
  if (appState.image.processing)
    return res.status(410).json({ error: "Already processing." });

  appState.image.processing = true;
  const cwd = process.cwd();
  const files = fs.readdirSync(cwd);
  const rawFiles = files.filter(file => /\.cr2$/i.test(file));
  const jpgFiles = files.filter(file => /\.jpe?g$/i.test(file));
  const endAt = rawFiles.length + jpgFiles.length;
  if (endAt === 0)
    return res.status(410).json({ error: "No image files found to process." });
  appState.image.jpeg = { current: { resized: 0 }, end: jpgFiles.length };
  appState.image.raw = {
    current: { resized: 0, extracted: 0 },
    end: rawFiles.length
  };

  res.json({ status: "Image processing started." });

  //    wsProgress(appState.image);
  const size = "1620x1080";
  const rawDir = path.join(cwd, "raw");
  const jpgDir = path.join(cwd, "jpg");
  const resizeDir = path.join(cwd, "resized", "size_" + size);
  let fileOut;

  let p = Promise.resolve()
    .then(
      async () =>
        new Promise(async (resolve, reject) => {
          try {
            if (!fs.existsSync(rawDir)) fs.mkdirSync(rawDir);
            if (!fs.existsSync(jpgDir)) fs.mkdirSync(jpgDir);
            if (!fs.existsSync(resizeDir)) await fs.mkdirp(`${resizeDir}`);
            return resolve();
          } catch (e) {
            reject(e);
          }
        })
    )
    .catch(e => {
      const msg = `Processing photos failed with: ${e.messsage}`;
      console.error(msg);
      appState.image.error = msg;
      appState.image.processing = false;
      wsProgress(appState.image);
    });

  // handle raw files
  rawFiles.forEach((file, idx) => {
    p = p.then(
      () =>
        new Promise(resolve => {
          const cmd = `${dcraw} -e ${file}`;
          exec(cmd, { cwd }, (error, stdout, stderr) => {
            fs.moveSync(path.join(cwd, file), path.join(rawDir, file));
            const baseName = file.split(".")[0];
            fileOut = baseName + ".JPG";
            const thumb = baseName + ".thumb.jpg";
            fs.moveSync(path.join(cwd, thumb), path.join(jpgDir, fileOut));
            appState.image.raw.current.extracted++;
            wsProgress(appState.image);
            return resolve();
          });
        })
    );
    p = p.then(
      () =>
        new Promise(resolve => {
          const cmd = `${convert} "${path.join(
            jpgDir,
            fileOut
          )}" -resize ${size} "${path.join(resizeDir, fileOut)}"`;

          exec(cmd, () => {
            appState.image.raw.current.resized++;
            appState.image.processing = isProcessing(appState.image);
            wsProgress(appState.image);
            return resolve();
          });
        })
    );
  });

  // handle jpg files
  jpgFiles.forEach((file, idx) => {
    p = p.then(
      () =>
        new Promise(resolve => {
          const ori = path.join(cwd, file);
          const mved = path.join(jpgDir, file);
          fs.moveSync(ori, mved);
          const cmd = `${convert} "${mved}" -resize ${size} "${path.join(
            resizeDir,
            file
          )}"`;

          exec(cmd, () => {
            appState.image.jpeg.current.resized++;
            appState.image.processing = isProcessing(appState.image);
            wsProgress(appState.image);
            return resolve();
          });
        })
    );
  });

  p = p.catch(e => {
    const msg = `Processing photos failed with: ${e.messsage}`;
    console.error(msg);
    appState.image.error = msg;
    appState.image.processing = false;
    wsProgress(appState.image);
  });
  return p;
};

function reset(_, res) {
  const cwd = process.cwd();
  if (fs.existsSync(`${cwd}ori`)) {
    fs.removeSync(`${cwd}/jpg`);
    fs.removeSync(`${cwd}/raw`);
    fs.removeSync(`${cwd}/resized`);
    fs.copySync(`${cwd}ori`, `${cwd}`);
    res.json({ status: `Reset ${cwd} using ${cwd}ori.` });
  } else {
    const msg = `Failed! Missing ${cwd}ori.`;
    console.error(msg);
    res.status(410).json({ error: `Error! Failed finding ${cwd}ori.` });
  }
}

module.exports = {
  process: processImages,
  reset
};
