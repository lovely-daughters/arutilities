/**
 * twitter.ts
 *
 * Motivated out of wanting an efficent way to download & organize illustrations.
 *
 * Very Rough Overview:
 * 1) Detect like click
 * 2) Find bounding tweet of the like button
 * 3) Scan tweet for image srcs
 * 4) Download srcs
 *
 * Details:
 * 1) Add click event listener to document.
 *  - Added to document b/c i'm looking for click events on EVERY like button in my feed. The alternative would be detecting scrolls and adding an event listener to every new tweet's like button that pops up. Furthermore, due to the fack that twitter button can have 6+ layers in the DOM, you end up with a lot of clickable elements that lead to a like. Which one do you attach the event listener to? Exactly. Situation gets FUCKED. Still some challenges when linking event listener to the document, but that will be addressed later.
 * 1.5) Use mousedown event instead of click
 *  - click event listeners don't seem to activate when clicking on locations where the cursor turns to 'pointer'. Guessing they disabled pointer events. Mousedown effectively does the same.
 *
 * CONSIDERATION 1:
 *  - When event listening on the ENTIRE document, you have to filter out clicks ONLY for the area of interest. Doing so has it's own challenges
 *
 * 2) Ensure event.path has a div with data-testid of 'like'
 *  - This addresses the consideration above. If from your click location you find an ancestor with data-testid of 'like' that means an ancestor is the container for the ENTIRE clickable space of the like button. Seeing this in event.path provides a guarantee that the user clicked the like button.
 *
 * 3) Get element with data-testid of 'tweet' from event.path
 *  - Highest ancestor element of tweet. When doing the descendant image scan later, want to ensure we're high enough on the DOM to get the tweet images, but not high enough to get OTHER tweet images. Finding an element on the event path with that data-testid solves this.
 *
 * 4) Use querySelectorAll('img[alt="Image"].css-9pa8cd') to get relevant images.
 *  - Not all image tags contain the images of interest. With icons in both the tweet and tweet text, need to filter. I'm not happy with using a css class as that could very well change with next twitter update, but I can't think of a better solution at the moment.
 *
 * 5) Extract src attributes from images.
 *
 * CONSIDERATION 2:
 *  - The image src is already engouh to download the image. However, I want to organize downloads such that each artist has their own folder & I can pull up the tweet on the webpage from the information in the filename. With just the srcs gained so far, I can do neither of those. Tweet metadata is needed. However, how should one go about gathering the artist name & status.
 *
 * 6) Get metadata from tweet URL
 *  - The URL that leads to the tweet itself contains all the information needed which incidentally is located on the 'date' portion of every tweet. After using querySelectorAll to find all link descendants of the tweet element, that's where tweetUrlRegex comes into play. Filter out all href's that don't match and we got the metadata.
 *
 * 7) Extract user & status metadata from tweet URL
 *  - Job for regex groups & match function.
 *
 * CONSIDERATION 3:
 *  - When using the chrome downloads API, if you set a custom path, you have to specify the filename as well. This means we also need to provide the file extension, which can vary from tweet to tweet.
 *
 * 8) Get file extension from src URL
 *
 * CONSIDERATION 4:
 *  - If you're downloading not from tweet page but feed, image quality is reduced and set to 'medium'.
 *
 * 9) Modify src download url to use 'large' format
 *  - Done with regex repcalement
 *
 * 10) Pass user, status, src, ext to chrome downloads api for each image
 *  - Will need to go through messaging to hit the background service for the download.
 *
 * And Done :)
 */

/**
 * Changelog
 *
 * 20220706 - Changed Twitter Language to Chinese. Updated alt="Image" to alt="图像" to work w. CN version. Can change back when using english.
 */

import { Download } from "@aru/messages/src/TwitterDownload";

const tweetUrlRegex = /^\/(.+)\/status\/([0-9]+)$/;
const srcNameReplaceRegex =
  /^(https\:\/\/pbs\.twimg\.com\/media\/.+\?format=.+&name=)(.+)$/;
const srcFormatMatchRegex =
  /^https\:\/\/pbs\.twimg\.com\/media\/.+\?format=(.+)&name=.+$/;

// After a click anywhere on the page, checks the eventPath to see if the click originates within a like element. If so, return that element.
const getTweetIfLiked = (eventPath: Array<HTMLElement>): HTMLElement | null => {
  let likeCheck = false;
  try {
    for (let index = 0; index < eventPath.length; index++) {
      const element = eventPath[index];
      const dataTestId = element.getAttribute("data-testid");

      if (dataTestId === "like") {
        likeCheck = true;
      } else if (likeCheck === true && dataTestId === "tweet") {
        return element;
      }
    }
  } catch (e) {
    console.error(e);
  }

  return null;
};

const findTweetSrcs = (tweet: HTMLElement) => {
  const returnSrcs = [];

  // ENGLISH
  // const descendantImages = tweet.querySelectorAll(
  //   'img[alt="Image"].css-9pa8cd'
  // );

  // CN
  const descendantImages = tweet.querySelectorAll('img[alt="图像"].css-9pa8cd');

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

const sendDownloadMessage = (
  user: string,
  status: string,
  index: number,
  src: string,
  ext: string
) => {
  chrome.runtime.sendMessage(
    Download.generateMessage(src, `./twitter/${user}/${status}-${index}.${ext}`)
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
        sendDownloadMessage(
          data.user,
          data.status,
          index + 1,
          src.replace(srcNameReplaceRegex, "$1large"),
          formatMatch[1]
        );
      }
    }
  }
};

document.addEventListener("mousedown", (event: any) => {
  // const tweet = getTweetIfLiked(event.path); // event.path deprecated
  const tweet = getTweetIfLiked(event.composedPath());

  if (tweet) {
    downloadTweetImages(tweet);
  }
});
