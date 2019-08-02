import React, { Suspense } from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Container from "@material-ui/core/Container";
import Card from "@material-ui/core/Card";
import Button from "@material-ui/core/Button";
import Tooltip from "@material-ui/core/Tooltip";
import FolderIcon from "@material-ui/icons/Folder";
import ComputerIcon from "@material-ui/icons/Computer";

import { wsUrl, routes, imgProcInitial, useStyles } from "./App-const";
const DisplayImages = React.lazy(() => import("./DispImgs"));

function App() {
  const [files, filesSet] = React.useState([]);
  const [filesReloadForce, filesReloadForceSet] = React.useState(true);
  const [pwd, pwdSet] = React.useState("");
  const [serverUp, serverUpSet] = React.useState("");
  const [err, errSet] = React.useState("");
  const [imgProc, imgProcSet] = React.useState(imgProcInitial);
  const [img2display, img2displaySet] = React.useState(null);

  const classes = useStyles();

  const fetchFailed = item => err => {
    const e = err.message || err;
    const msg = `Server fetch failed for ${item} with: ${e}`;
    console.error(msg);
    errSet(msg);
  };

  const testPwdE = json => {
    pwdSet(json.pwd);
    if (json.error)
      return Promise.reject(json.error + " Reseting dir to " + json.pwd);
  };

  React.useEffect(() => {
    fetch(routes.files)
      .then(data => data.json())
      .then(json => filesSet(json.files))
      .catch(fetchFailed(routes.files));
  }, [pwd, filesReloadForce]);

  React.useEffect(() => {
    fetch(routes.pwd)
      .then(data => data.json())
      .then(testPwdE)
      .catch(fetchFailed(routes.pwd));

    const ws = new WebSocket(wsUrl);
    ws.onopen = _ => {
      console.log("ws connected");
      serverUpSet(true);
      ws.send(JSON.stringify({ status: "kick start ws connection" }));
    };
    ws.onclose = _ => {
      console.log("ws disconnected");
      serverUpSet(false);
      errSet("Server WebSocket Disconnected. Refresh client to reconnect.");
    };
    ws.onmessage = e => {
      const data = JSON.parse(e.data);
      console.log(data);
      if (data.error) return errSet(data.error);
      imgProcSet(data);
      filesReloadForceSet(v => !v);
    };
  }, []);

  const clicked = file => {
    if (!file.isDirectory) return;
    const pwd = routes.chdir + "/" + file.name;
    fetch(pwd)
      .then(data => data.json())
      .then(testPwdE)
      .catch(fetchFailed(pwd));
  };

  const back = _ => {
    fetch(routes.back)
      .then(data => data.json())
      .then(testPwdE)
      .catch(fetchFailed(routes.back));
  };

  const processImages = _ => {
    fetch(routes.processImages)
      .then(data => data.json())
      .catch(fetchFailed(routes.processImages));
  };

  const reset = _ => {
    fetch(routes.resetImages)
      .then(data => data.json())
      .then(data => filesReloadForceSet(v => !v))
      .catch(fetchFailed(routes.resetImages));
  };

  const preview = _ => {
    if (!img2display) img2displaySet({ image: "bob" });
    else img2displaySet(null);
  };

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" color="inherit" className={classes.root}>
            Files
          </Typography>
          <div style={{ color: serverUp ? "inherit" : "red" }}>
            <Tooltip
              title={`Server Websocket Status: ${
                serverUp ? "connected" : "disconnected"
              }`}
            >
              <ComputerIcon />
            </Tooltip>
          </div>
        </Toolbar>
      </AppBar>

      <Paper className={classes.dirs}>
        <Container>
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={processImages}
            disabled={imgProc.processing}
          >
            Process
          </Button>
          {imgProc.processing && (
            <Typography variant="body2" component="span">
              <b>Raw:</b> extracted:{imgProc.raw.current.extracted}/
              {imgProc.raw.end}, resized:{imgProc.raw.current.extracted}/
              {imgProc.raw.end},<b>Jpeg:</b> resized:
              {imgProc.jpeg.current.resized}/{imgProc.jpeg.end}
            </Typography>
          )}

          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={reset}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={preview}
          >
            Preview
          </Button>
        </Container>
        <Container>
          <Typography variant="h6" component="span">
            Directory:
          </Typography>{" "}
          <Typography variant="body2" component="span">
            {pwd}
          </Typography>
          {err && (
            <Typography
              variant="body2"
              component="p"
              onClick={() => errSet("")}
              className={classes.error}
            >
              {err} <b>Click to clear.</b>
            </Typography>
          )}
        </Container>
        <Container className={classes.gridC}>
          {pwd !== "/" && err.length === 0 ? (
            <Card className={classes.card} onClick={back}>
              <Typography variant="body2" component="p">
                ..
              </Typography>
            </Card>
          ) : null}
          {files.map(file => (
            <Card
              className={classes.card}
              key={file.ino}
              onClick={() => clicked(file)}
            >
              <Typography
                variant="body2"
                component="p"
                className={classes.file}
              >
                {file.isDirectory ? (
                  <FolderIcon className={classes.icon} />
                ) : null}{" "}
                {file.name}
              </Typography>
            </Card>
          ))}
        </Container>
      </Paper>
      <Suspense fallback={<div>Loading images</div>}>
        {img2display && <DisplayImages {...{ pwd, files }} />}
        {/*<DisplayImages {...{ pwd, files }} /> */}
      </Suspense>
    </div>
  );
}

export default App;
