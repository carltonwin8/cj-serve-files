import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Container from "@material-ui/core/Container";
import Card from "@material-ui/core/Card";
import FolderIcon from "@material-ui/icons/Folder";
import Button from "@material-ui/core/Button";

const wsUrl = "ws://localhost:8080";

const routes = {
  files: "/api/files",
  pwd: "/api/pwd",
  back: "/api/back",
  chdir: "/api/chdir",
  processImages: "/api/process-images",
  resetImages: "/api/reset-images"
};

const imgProcInitial = {
  error: null,
  processing: false,
  raw: { end: 0, current: { extracted: 0, resized: 0 } },
  jpeg: { end: 0, current: { resized: 0 } }
};

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  dirs: {
    padding: theme.spacing(3, 2),
    margin: theme.spacing(3, 2)
  },
  button: {
    padding: theme.spacing(1),
    margin: theme.spacing(1)
  },
  gridC: {
    display: "flex",
    flexWrap: "wrap"
  },
  card: {
    background: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    margin: theme.spacing(1),
    padding: theme.spacing(1),
    borderRadius: theme.spacing(2),
    "&:hover": {
      background: theme.palette.secondary.dark
    }
  },
  file: {
    display: "flex",
    alignItems: "center"
  },
  icon: {
    color: theme.palette.primary.light,
    marginRight: theme.spacing(0.7)
  },
  error: {
    textAlign: "center",
    background: theme.palette.error.main,
    margin: theme.spacing(1),
    padding: theme.spacing(1),
    borderRadius: theme.spacing(2),
    color: theme.palette.error.contrastText,
    "&:hover": {
      background: theme.palette.error.light
    }
  }
}));

function App() {
  const [files, filesSet] = React.useState([]);
  const [filesReloadForce, filesReloadForceSet] = React.useState(true);
  const [pwd, pwdSet] = React.useState("");
  const [err, errSet] = React.useState("");
  const [imgProc, imgProcSet] = React.useState(imgProcInitial);

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
      ws.send(JSON.stringify({ status: "kick start ws connection" }));
    };
    ws.onclose = _ => {
      console.log("ws disconnected");
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
      .then(data => console.log(data))
      .catch(fetchFailed(routes.processImages));
  };

  const preview = _ => {
    fetch(routes.resetImages)
      .then(data => data.json())
      .then(data => console.log(data) || filesReloadForceSet(v => !v))
      .catch(fetchFailed(routes.resetImages));
  };

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" color="inherit">
            Files
          </Typography>
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
    </div>
  );
}

export default App;
