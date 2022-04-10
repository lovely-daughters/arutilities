import { TwitterDownload } from "@aru/messages/src/TwitterDownload";

const tweetUrlRegex = /^\/(.+)\/status\/([0-9]+)$/;
const srcNameReplaceRegex =
  /^(https\:\/\/pbs\.twimg\.com\/media\/.+\?format=.+&name=)(.+)$/;
const srcFormatMatchRegex =
  /^https\:\/\/pbs\.twimg\.com\/media\/.+\?format=(.+)&name=.+$/;

const findTweetSrcs = (tweet: HTMLElement) => {
  const returnSrcs = [];

  const descendantImages = tweet.querySelectorAll(
    'img[alt="Image"].css-9pa8cd'
  );
  console.log(descendantImages);

  for (let index = 0; index < descendantImages.length; index++) {
    const image = descendantImages[index];
    const src = image.getAttribute("src");

    console.log(src);

    if (src) {
      returnSrcs.push(src);
    }
  }

  return returnSrcs;
};

const findTweetUrl = (tweet: HTMLElement) => {
  const descendantLinks = tweet.querySelectorAll("a[role='link']");
  console.log(descendantLinks);

  for (let index = 0; index < descendantLinks.length; index++) {
    const link = descendantLinks[index];
    const href = link.getAttribute("href");

    if (href && tweetUrlRegex.test(href)) {
      return href;
    }
  }

  return null;
};

const extractDataFromTweetUrl = (
  tweetUrl: string | null
): { user: string; status: string } | null => {
  if (tweetUrl) {
    const match = tweetUrl.match(tweetUrlRegex);
    if (match) {
      console.log(match);
      return {
        user: match[1],
        status: match[2],
      };
    }
  }
  return null;
};

const sendMessageTwitterDownload = (
  user: string,
  status: string,
  index: number,
  src: string,
  ext: string
) => {
  chrome.runtime.sendMessage(
    TwitterDownload.generateMessage(user, status, index, src, ext),
    () => {
      console.log("finished");
    }
  );
};

const downloadTweetImages = (tweet: HTMLElement) => {
  const srcs = findTweetSrcs(tweet);
  const data = extractDataFromTweetUrl(findTweetUrl(tweet));
  if (data && srcs) {
    for (let index = 0; index < srcs.length; index++) {
      const src = srcs[index];
      const formatMatch = src.match(srcFormatMatchRegex);
      if (formatMatch) {
        sendMessageTwitterDownload(
          data.user,
          data.status,
          index,
          src.replace(srcNameReplaceRegex, "$1large"),
          formatMatch[1]
        );
      }
    }
  }
};

const reactRoot = document.getElementById("react-root");
reactRoot?.insertAdjacentHTML(
  "beforebegin",
  "<div style='color: white;'>ARUUUUU</div>"
);
console.log(reactRoot);

document.addEventListener("mousedown", (event: any) => {
  console.log(event.path);

  const eventPath: Array<HTMLElement> = event.path;

  let likeCheck = false;
  let tweetElement: HTMLElement | null = null;

  try {
    for (let index = 0; index < eventPath.length; index++) {
      const element = eventPath[index];
      const dataTestId = element.getAttribute("data-testid");
      console.log(dataTestId);

      if (dataTestId === "like") {
        likeCheck = true;
      } else if (likeCheck === true && dataTestId === "tweet") {
        tweetElement = element;
      }
    }
  } catch (e) {
    console.error(e);
  }

  if (likeCheck && tweetElement) {
    console.log(likeCheck);
    console.log(tweetElement);

    downloadTweetImages(tweetElement);
    // Download Each Image in Tweet
    // descendantImages.forEach((image) => {
    //   const src = image.getAttribute("src");
    //   if (src) {
    //     chrome.runtime.sendMessage(
    //       TwitterDownload.generateMessage(src, "test")
    //     );
    //     console.log("message sent");
    //   }
    // });
  }
});
