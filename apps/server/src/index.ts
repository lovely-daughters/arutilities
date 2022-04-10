import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";

import { YoutubePayload } from "@aru/messages/src/YoutubeDownload";
import { execSync } from "child_process";
import { readdirSync } from "fs";

const PORT = 5000;
const TEMP_PATH = path.resolve(__dirname, "..", "temp");
const ITUNES_AUTO_PATH =
  "/Users/elim-mbp-01/Music/Music/Media.localized/Automatically Add to Music.localized";

const YT_URL_REGEX = /^https:\/\/youtu\.b.\/[a-zA-Z0-9]+$/;

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Sanity Check");
});

app.post("/yt-dlp", (req, res) => {
  console.log(req.body);

  const payload: YoutubePayload = req.body;

  if (YT_URL_REGEX.test(payload.url)) {
    try {
      const commandDownload = `yt-dlp -f m4a ${payload.url} -P "${TEMP_PATH}"`;
      console.log(commandDownload);
      execSync(commandDownload);

      const files = readdirSync(TEMP_PATH);
      files.forEach((file) => {
        fs.renameSync(
          path.resolve(TEMP_PATH, file),
          path.join(ITUNES_AUTO_PATH, file)
        );
      });

      res.send("DONE");
    } catch (e) {
      console.error(e);
      res.status(400).send(e);
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server on ${PORT}`);
});
