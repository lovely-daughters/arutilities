import { Heading } from "./flair/heading";
import { Images } from "./flair/images";
import { TwitterDownload } from "./forms/twitter-download";
import { YTDownload } from "./forms/yt-download";

export default function App() {
  return (
    <div style={{ padding: 10 }}>
      <Heading />
      <Images />

      <YTDownload />
      <br></br>
      <TwitterDownload />
    </div>
  );
}
