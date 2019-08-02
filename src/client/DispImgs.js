import React from "react";
import Paper from "@material-ui/core/Paper";

import { useStyles } from "./DispImgs-const";

function DispImgs(args) {
  const classes = useStyles();

  const imgs = args.files.filter(file => /\.jpe?g$/i.test(file.name));
  return (
    <Paper className={classes.root}>
      {imgs.map(img => (
        <img src={`/api/images/${img.name}`} alt="pics" />
      ))}
    </Paper>
  );
}

export default DispImgs;
