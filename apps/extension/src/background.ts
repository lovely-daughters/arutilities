import {
  AruMessage,
  TwitterDownload,
  TwitterDownloadPayload,
} from "@aru/messages/src/TwitterDownload";

chrome.runtime.onMessage.addListener(
  (request: AruMessage<TwitterDownloadPayload>, sender, sendResponse) => {
    console.log("SANITY CHECK");

    if (request.name === TwitterDownload.name) {
      const payload = request.payload;

      console.log(
        `./twitter/${payload.user}/${payload.status}-${payload.index}.${payload.ext}`
      );

      chrome.downloads.download({
        url: request.payload.src,
        filename: `./twitter/${payload.user}/${payload.status}-${payload.index}.${payload.ext}`,
      });

      sendResponse("success");
    }
  }
);
