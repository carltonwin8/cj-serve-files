import React from "react";

export const initialValues = {
  pwd: "",
  files: [],
  selected: [],
  add: img => {},
  remove: ino => {}
};
export default React.createContext(initialValues);
