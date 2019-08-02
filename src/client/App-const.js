import { makeStyles } from "@material-ui/core/styles";

import rt from "../common/routes";

export const routes = rt;

export const wsUrl = "ws://localhost:8080";

export const imgProcInitial = {
  error: null,
  processing: false,
  raw: { end: 0, current: { extracted: 0, resized: 0 } },
  jpeg: { end: 0, current: { resized: 0 } }
};

export const useStyles = makeStyles(theme => ({
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
