import {
  AruMessage,
  Download,
  DownloadPayload,
  TwitterDownload,
  TwitterDownloadPayload,
} from "@aru/messages/src/TwitterDownload";

chrome.runtime.onMessage.addListener(
  (request: AruMessage<DownloadPayload>, sender, sendResponse) => {
    if (request.name === Download.name) {
      const payload = request.payload;

      chrome.downloads
        .download({
          url: payload.url,
          filename: payload.filename,
        })
        .then(() => {
          sendResponse("success");
        })
        .catch(() => {
          sendResponse("failure");
        });
    }
  }
);
