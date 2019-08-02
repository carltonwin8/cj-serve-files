import React from "react";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";

import AddCircleIcon from "@material-ui/icons/AddCircle";
import RemoveCircleIcon from "@material-ui/icons/RemoveCircle";
import InfoIcon from "@material-ui/icons/Info";

import { useStyles } from "./DispImgs-const";
import ImgContext from "./ImgContext";
import { HtmlTooltip } from "./App-const";

function DispImgs(args) {
  const imgContext = React.useContext(ImgContext);
  const classes = useStyles();

  const imgs = args.add
    ? imgContext.files.filter(file => /\.jpe?g$/i.test(file.name))
    : imgContext.selected;

  console.log("imgs", imgContext);
  return (
    <Paper className={classes.root}>
      {imgs.map(img => (
        <div key={img.ino} className={classes.imgNadd}>
          <img src={`/api/images/${img.name}`} alt="pics" />
          <div
            className={classes.add}
            onClick={() =>
              args.add && !img.selected
                ? imgContext.add(img)
                : imgContext.remove(img)
            }
          >
            {args.add && !img.selected ? (
              <AddCircleIcon />
            ) : (
              <RemoveCircleIcon />
            )}
          </div>
          <div className={classes.info}>
            <HtmlTooltip
              title={
                <Typography>
                  {img.name} - {img.ino}
                </Typography>
              }
            >
              <InfoIcon />
            </HtmlTooltip>
          </div>
        </div>
      ))}
    </Paper>
  );
}

export default DispImgs;
