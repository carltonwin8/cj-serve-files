import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles(theme => ({
  root: {
    display: "grid",
    gridTemplateColumns: "repeat(10, 1fr)",
    padding: theme.spacing(3, 2),
    margin: theme.spacing(3, 2)
  }
}));
