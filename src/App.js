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
  processImages: "/api/process-images"
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
    marginRight: theme.spacing(1)
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
  const [pwd, pwdSet] = React.useState("");
  const [err, errSet] = React.useState("");
  const [imgToProc, imgToProcSet] = React.useState(0);
  const [imgProced, imgProcedSet] = React.useState(0);
  const [imgProcing, imgProcingSet] = React.useState(false);
  const wsConnection = React.useRef(null);

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
  }, [pwd]);

  React.useEffect(() => {
    fetch(routes.pwd)
      .then(data => data.json())
      .then(testPwdE)
      .catch(fetchFailed(routes.pwd));

    const ws = new WebSocket(wsUrl);
    wsConnection.current = ws;
    ws.onopen = _ => {
      console.log("connected");
      ws.send(JSON.stringify({ status: "kick start ws connection" }));
    };
    ws.onclose = _ => console.log("disconnected");
    ws.onmessage = e => {
      console.log(e);
      const { current, last, processing } = JSON.parse(e.data);
      imgProcedSet(current);
      imgToProcSet(last);
      imgProcingSet(processing);
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
    console.log("connection current", wsConnection.current);
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
            disabled={imgProcing}
          >
            Process
          </Button>
          {imgToProc !== 0 && imgToProc !== imgProced && (
            <Typography variant="body2" component="span">
              {imgProced}/{imgToProc}
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
