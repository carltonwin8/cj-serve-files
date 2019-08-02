import React from "react";

const displayImages = args => {
  const imgs = args.files.filter(file => /\.jpe?g$/i.test(file.name));
  return <div>{JSON.stringify(imgs)}</div>;
};

export default displayImages;
