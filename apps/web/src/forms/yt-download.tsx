import React from "react";

export function YTDownload() {
  const [url, setUrl] = React.useState<string>("");
  const [format, setFormat] = React.useState<string>("m4a");
  const [itunes, setItunes] = React.useState<string>("yes");

  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [response, setResponse] = React.useState<string>("");

  const onUrlChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setUrl(e.target.value);
  };

  const onFormatChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setFormat(e.target.value);
  };

  const onItunesChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setItunes(e.target.value);
  };

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    if (!url) {
      return;
    }

    setSubmitting(true);

    fetch("http://localhost:5000/yt-dlp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        format,
        itunes,
      }),
    })
      .then((res) => {
        if (res.ok) {
          setResponse("Success");
        } else {
          setResponse("Error: " + res.statusText);
        }
      })
      .finally(() => {
        setSubmitting(false);
        setUrl("");
      });
  };

  return (
    <form onSubmit={onSubmit}>
      <p style={{ margin: 0, fontWeight: "bold" }}>YT Download</p>

      <div style={{ fontSize: 12 }}>
        <label>
          YT URL:
          <input
            placeholder="yt-url"
            value={url}
            onChange={onUrlChange}
            disabled={submitting}
          ></input>
        </label>

        <br></br>

        <label>
          MEDIA TYPE:
          <div style={{ fontSize: 9, display: "inline" }}>
            <label>
              <input
                type="radio"
                name="format"
                value="m4a"
                checked={format === "m4a"}
                onChange={onFormatChange}
                disabled={submitting}
              ></input>
              m4a
            </label>
            <label>
              <input
                type="radio"
                name="format"
                value="mp3"
                checked={format === "mp3"}
                onChange={onFormatChange}
                disabled={submitting}
              ></input>
              mp3
            </label>
            <label>
              <input
                type="radio"
                name="format"
                value="mp4"
                checked={format === "mp4"}
                onChange={onFormatChange}
                disabled={submitting}
              ></input>
              mp4
            </label>
          </div>
        </label>

        <br></br>

        <label>
          ADD TO ITUNES:
          <div style={{ fontSize: 9, display: "inline" }}>
            <label>
              <input
                type="radio"
                name="itunes"
                value="yes"
                checked={itunes === "yes"}
                onChange={onItunesChange}
                disabled={submitting}
              ></input>
              yes
            </label>
            <label>
              <input
                type="radio"
                name="itunes"
                value="no"
                checked={itunes === "no"}
                onChange={onItunesChange}
                disabled={submitting}
              ></input>
              no
            </label>
          </div>
        </label>

        <br></br>
        <p style={{ margin: 0, fontStyle: "italic" }}>{response}</p>
      </div>

      <button disabled={submitting}>Submit</button>
    </form>
  );
}
