import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";

import { YoutubePayload } from "@aru/messages/src/YoutubeDownload";
import { execSync } from "child_process";
import { readdirSync } from "fs";

const PORT = 5000;
const TEMP_PATH = path.resolve(__dirname, "..", "temp");
const DOWNLOADS_PATH = "~/Downloads";
const ITUNES_AUTO_PATH =
  "/Users/elim-mbp-01/Music/Music/Media.localized/Automatically Add to Music.localized";

const YT_URL_REGEX = /^https:\/\/youtu\.b.\/[a-zA-Z0-9\-\_]+$/;

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Sanity Check");
});

app.post("/yt-dlp", (req, res) => {
  console.log(req.body);

  const payload: YoutubePayload = req.body;

  if (YT_URL_REGEX.test(payload.url) && payload.format.length === 3) {
    try {
      const commandDownload = `yt-dlp -f ${payload.format} ${payload.url} -P "${
        payload.itunes === "yes" ? TEMP_PATH : DOWNLOADS_PATH
      }"`;
      console.log(commandDownload);
      execSync(commandDownload);

      if (payload.itunes) {
        const files = readdirSync(TEMP_PATH);
        files.forEach((file) => {
          console.log("Moving to Itunes");
          fs.renameSync(
            path.resolve(TEMP_PATH, file),
            path.join(ITUNES_AUTO_PATH, file)
          );
        });
      }

      res.send("DONE");
    } catch (e) {
      console.error(e);
      res.status(400).send(e);
    }
  } else {
    console.log("Sanitization Failed");
    res.status(400).send("Sanitization Failed");
  }
});

app.listen(PORT, () => {
  console.log(`Server on ${PORT}`);
});
