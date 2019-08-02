import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles(theme => ({
  root: {
    background: "lightPink",
    display: "grid",
    gridGap: "3px",
    gridTemplateColumns: "repeat(auto-fit, minmax(75px, 1fr))",
    gridAutoFlow: "dense",
    padding: theme.spacing(3, 2),
    margin: theme.spacing(3, 2)
  }
}));
