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
 * 20240124 - binding "l" key to like current tweet. can use one hand while browsing tweets.
 * 20241022 - Using twitter api to download images + videos. In every request there's a TweetDetail api endpoint. /i/api/graphql/...
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
  // const descendantImages = tweet.querySelectorAll('img[alt="图像"].css-9pa8cd');
  const descendantImages = tweet.querySelectorAll("img.css-9pa8cd");

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

  console.log(tweet);
  if (tweet) {
    const tweet_url = findTweetUrl(tweet);
    const tweet_id = tweet_url?.split("/status/").pop();
    console.log(tweet_id);

    fetch(
      `https://x.com/i/api/graphql/nBS-WpgA6ZG0CyNHD517JQ/TweetDetail?variables=%7B%22focalTweetId%22%3A%22${tweet_id}%22%2C%22with_rux_injections%22%3Afalse%2C%22rankingMode%22%3A%22Relevance%22%2C%22includePromotedContent%22%3Atrue%2C%22withCommunity%22%3Atrue%2C%22withQuickPromoteEligibilityTweetFields%22%3Atrue%2C%22withBirdwatchNotes%22%3Atrue%2C%22withVoice%22%3Atrue%7D&features=%7B%22rweb_tipjar_consumption_enabled%22%3Atrue%2C%22responsive_web_graphql_exclude_directive_enabled%22%3Atrue%2C%22verified_phone_label_enabled%22%3Afalse%2C%22creator_subscriptions_tweet_preview_api_enabled%22%3Atrue%2C%22responsive_web_graphql_timeline_navigation_enabled%22%3Atrue%2C%22responsive_web_graphql_skip_user_profile_image_extensions_enabled%22%3Afalse%2C%22communities_web_enable_tweet_community_results_fetch%22%3Atrue%2C%22c9s_tweet_anatomy_moderator_badge_enabled%22%3Atrue%2C%22articles_preview_enabled%22%3Atrue%2C%22responsive_web_edit_tweet_api_enabled%22%3Atrue%2C%22graphql_is_translatable_rweb_tweet_is_translatable_enabled%22%3Atrue%2C%22view_counts_everywhere_api_enabled%22%3Atrue%2C%22longform_notetweets_consumption_enabled%22%3Atrue%2C%22responsive_web_twitter_article_tweet_consumption_enabled%22%3Atrue%2C%22tweet_awards_web_tipping_enabled%22%3Afalse%2C%22creator_subscriptions_quote_tweet_preview_enabled%22%3Afalse%2C%22freedom_of_speech_not_reach_fetch_enabled%22%3Atrue%2C%22standardized_nudges_misinfo%22%3Atrue%2C%22tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled%22%3Atrue%2C%22rweb_video_timestamps_enabled%22%3Atrue%2C%22longform_notetweets_rich_text_read_enabled%22%3Atrue%2C%22longform_notetweets_inline_media_enabled%22%3Atrue%2C%22responsive_web_enhance_cards_enabled%22%3Afalse%7D&fieldToggles=%7B%22withArticleRichContentState%22%3Atrue%2C%22withArticlePlainText%22%3Afalse%2C%22withGrokAnalyze%22%3Afalse%2C%22withDisallowedReplyControls%22%3Afalse%7D`,
      {
        headers: {
          accept: "*/*",
          "accept-language": "en-US,en;q=0.9,haw;q=0.8",
          authorization:
            "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA",
          "cache-control": "no-cache",
          "content-type": "application/json",
          pragma: "no-cache",
          priority: "u=1, i",
          "sec-ch-ua":
            '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"macOS"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "sec-gpc": "1",
          "x-client-transaction-id":
            "DMKEgDE6ofLUwNmAxV1H/EvnWqNnUboc5sVdrSx/B2Losd4dt5ONFAz79pY6whZeBJH1xA6s+9s8lMdl3NNjFtlVuPQYDw",
          "x-csrf-token":
            "41f63a8d1ee53dd02ff2611bec2526ce5d3707c75454dfe25835a806b26279ae27e984b9c47259f8494f4f69501c2a1da445cea2a3d265c5ff156eeea2196cf363b904ca661f73bce89dfcc4c03fa86b",
          "x-twitter-active-user": "yes",
          "x-twitter-auth-type": "OAuth2Session",
          "x-twitter-client-language": "zh-cn",
        },
        referrer: `${tweet_url}`,
        referrerPolicy: "strict-origin-when-cross-origin",
        body: null,
        method: "GET",
        mode: "cors",
        credentials: "include",
      }
    )
      .then((response: Response) => {
        const reader = response.body!.getReader();
        let chunks: any[] = [];
        let decoder = new TextDecoder();

        return reader
          .read()
          .then(function processText({ done, value }): Promise<JSON> {
            if (done) {
              // Convert chunks into a string and then parse JSON
              const jsonString = chunks.join("");
              return JSON.parse(jsonString);
            }

            // Decode the chunk and add it to the array
            chunks.push(decoder.decode(value, { stream: true }));

            // Continue reading the next chunk
            return reader.read().then(processText);
          });
      })
      .then((json) => {
        console.log(json);

        const entry =
          // @ts-ignore
          json.data.threaded_conversation_with_injections_v2.instructions[0]
            .entries[0];
        const tweet_id = entry.entryId.split("-")[1];
        console.log(tweet_id);

        const media =
          entry.content.itemContent.tweet_results.result.legacy.entities
            .media[0];
        const type = media.type;
        console.log(type);

        if (type === "photo") {
          const photo_url = media.media_url_https;
          const large_photo_url =
            photo_url.split(".jpg")[0] + "?format=jpg&name=large";

          fetch(large_photo_url)
            .then((response) => response.blob())
            .then((blob) => {
              const blobUrl = URL.createObjectURL(blob);
              // Create an anchor element and trigger a download
              const a = document.createElement("a");
              a.href = blobUrl;
              if (type == "animated_gif" || type == "video") {
                a.download = `${tweet_id}.mp4`;
              } else if (type == "photo") {
                a.download = `${tweet_id}.jpg`;
              }
              document.body.appendChild(a);
              a.click();
              // Clean up
              a.remove();
              URL.revokeObjectURL(blobUrl);
            });
        } else if (type === "video" || type === "animated_gif") {
          const video_variants = media.video_info.variants;
          // @ts-ignore
          const highest_bitrate = video_variants.reduce((prev, current) =>
            prev.bitrate > current.bitrate ? prev : current
          );
          console.log(highest_bitrate.url);
          // fetch video and save it to downloads
          fetch(highest_bitrate.url)
            .then((response: Response) => {
              const reader = response.body!.getReader();
              const chunks: any[] = [];

              return reader
                .read()
                .then(function processChunk({ done, value }): any {
                  if (done) {
                    // Create a blob from the collected chunks
                    const blob = new Blob(chunks, { type: "video/mp4" });
                    const blobUrl = URL.createObjectURL(blob);

                    // Create an anchor element and trigger a download
                    const a = document.createElement("a");
                    a.href = blobUrl;

                    if (type == "animated_gif" || type == "video") {
                      a.download = `${tweet_id}.mp4`;
                    } else if (type == "photo") {
                      a.download = `${tweet_id}.mp4`;
                    }
                    document.body.appendChild(a);
                    a.click();

                    // Clean up
                    a.remove();
                    URL.revokeObjectURL(blobUrl);
                    return;
                  }

                  // Append chunk to chunks array
                  chunks.push(value);

                  // Continue reading the stream
                  return reader.read().then(processChunk);
                });
            })
            .catch((err) => {
              console.error("Failed to download video:", err);
            });
        }
      })
      .catch((err) => {
        console.error("Failed to parse stream:", err);
      });
  }

  // if (tweet) {
  //   // downloadTweetImages(tweet);

  // }
});

// 2024-01-24: checking keypress when using twitter keybinds
document.addEventListener("keypress", (event: any) => {
  if (event.key === "l") {
    console.log("sanity check");
    console.log(
      document.activeElement?.querySelector("div[data-testid='like']")
    );

    if (document.activeElement?.querySelector("div[data-testid='like']")) {
      console.log("sanity check 2");
      downloadTweetImages(document.activeElement as HTMLElement);
      navigator.clipboard.writeText(
        (
          document.activeElement.querySelector("time")
            ?.parentElement as HTMLLinkElement
        ).href
      );
    }
    // const tweet = getTweetIfLiked(event.composedPath());
  }
});
