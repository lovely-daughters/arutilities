import { AruMessage, TwitterDownload } from "@aru/messages/src/TwitterDownload";

chrome.runtime.onMessage.addListener(
  (request: AruMessage, sender, response) => {
    console.log("SANITY CHECK");

    if (request.name === TwitterDownload.name) {
      console.log(request.payload);

      chrome.downloads.download({
        url: request.payload.url,
      });
    }
  }
);
