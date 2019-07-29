import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Container from "@material-ui/core/Container";
import Card from "@material-ui/core/Card";
import FolderIcon from "@material-ui/icons/Folder";

const tempErr =
  "Error! Failed finding cj-photo-process in /Users/carltonjoseph/cj/cj2019/projects/cj-serve-files. Reseting dir to /Users/carltonjoseph/cj/cj2019/projects/cj-serve-files.";

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  dirs: {
    padding: theme.spacing(3, 2),
    margin: theme.spacing(3, 2)
  },
  gridC: {
    display: "flex",
    flexWrap: "wrap"
  },
  card: {
    background: theme.palette.secondary.main,
    margin: theme.spacing(),
    padding: theme.spacing(),
    borderRadius: theme.spacing(2),
    "&:hover": {
      background: theme.palette.primary.light
    }
  },
  file: {
    display: "flex",
    alignItems: "center"
  },
  error: {
    background: theme.palette.error.main,
    margin: theme.spacing(),
    padding: theme.spacing(),
    borderRadius: theme.spacing(2),
    "&:hover": {
      background: theme.palette.error.light
    }
  }
}));

const routes = {
  files: "/api/files",
  pwd: "/api/pwd",
  back: "/api/back",
  chdir: "/api/chdir"
};

function App() {
  const [files, filesSet] = React.useState([]);
  const [pwd, pwdSet] = React.useState("");
  const [err, errSet] = React.useState(tempErr);
  const classes = useStyles();

  const fetchFailed = item => e =>
    console.error("Fetch failed from", item, "with:", e) || errSet(e);
  const testPwdE = json => {
    pwdSet(json.pwd);
    if (json.error)
      return Promise.reject(json.error + " Reseting dir to " + json.pwd);
  };

  React.useEffect(() => {
    const { files } = routes;
    fetch(files)
      .then(data => data.json())
      .then(json => filesSet(json.files))
      .catch(fetchFailed(files));
  }, [pwd]);

  React.useEffect(() => {
    const { pwd } = routes;
    fetch(pwd)
      .then(data => data.json())
      .then(testPwdE)
      .catch(fetchFailed(pwd));
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
    const { back } = routes;
    fetch(back)
      .then(data => data.json())
      .then(testPwdE)
      .catch(fetchFailed(back));
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
        <Container className={classes.gridC}>
          {pwd !== "/" ? (
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
                {file.isDirectory ? <FolderIcon color="primary" /> : null}{" "}
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
