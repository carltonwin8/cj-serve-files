import { makeStyles } from "@material-ui/core/styles";
import { fade } from "@material-ui/core/styles/colorManipulator";
import { purple, white } from "@material-ui/core/colors";

export const useStyles = makeStyles(theme => ({
  root: {
    background: "lightPink",
    display: "grid",
    gridGap: "3px",
    gridTemplateColumns: "repeat(auto-fit, minmax(75px, 1fr))",
    gridAutoFlow: "dense",
    padding: theme.spacing(3, 2),
    margin: theme.spacing(3, 2)
  },
  imgNadd: {
    position: "relative"
  },
  add: {
    color: fade("#fff", 0.5),
    position: "absolute",
    bottom: 0,
    left: 0
  },
  info: {
    color: fade(purple[500], 0.5),
    position: "absolute",
    top: 0,
    left: 0
  },
  img: {
    display: "block",
    width: "100%",
    height: "auto"
  }
}));
