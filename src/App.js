import React from "react";

const routes = {
  files: "/api/files",
  pwd: "/api/pwd",
  back: "/api/back",
  chdir: "/api/chdir"
};

function App() {
  const [files, filesSet] = React.useState([]);
  const [pwd, pwdSet] = React.useState("");
  const [err, errSet] = React.useState("");

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
    <div>
      <h1>Files</h1>
      <p>
        <b>Directory:</b> {pwd}
      </p>
      {err && (
        <p onClick={() => errSet("")} style={{ background: "red" }}>
          {err}. Click to clear.
        </p>
      )}
      <div>
        {pwd !== "/" ? <div onClick={back}>..</div> : null}
        {files.map(file => (
          <div key={file.ino} onClick={() => clicked(file)}>
            {file.isDirectory ? "d" : "f"} - {file.name}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
