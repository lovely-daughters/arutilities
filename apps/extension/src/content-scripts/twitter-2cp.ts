/**
 * Changelog
 * 20241022 - Using twitter api to download images + videos. In every request there's a TweetDetail api endpoint. /i/api/graphql/...
 */

import { Download } from "@aru/messages/src/TwitterDownload";
import { execPath } from "process";

const tweetUrlRegex = /^\/(.+)\/status\/([0-9]+)$/;

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

interface Media {
  type: string;
  media_url_https: string;
  video_info: {
    variants: { bitrate: number; url: string }[];
  };
}

interface Entry {
  entryId: string;
  content: {
    itemContent: {
      tweet_results: {
        result: {
          legacy: {
            entities: {
              media: Media[];
            };
          };
          tweet: {
            legacy: {
              entities: {
                media: Media[];
              };
            };
          };
        };
      };
    };
  };
}

interface TweetDetails {
  data: {
    threaded_conversation_with_injections_v2: {
      instructions: {
        entries: Entry[];
      }[];
    };
  };
}

const getTweetDetails = (
  tweetId: string,
  tweetUrl: string
): Promise<TweetDetails> => {
  const json = fetch(
    `https://x.com/i/api/graphql/nBS-WpgA6ZG0CyNHD517JQ/TweetDetail?variables=%7B%22focalTweetId%22%3A%22${tweetId}%22%2C%22with_rux_injections%22%3Afalse%2C%22rankingMode%22%3A%22Relevance%22%2C%22includePromotedContent%22%3Atrue%2C%22withCommunity%22%3Atrue%2C%22withQuickPromoteEligibilityTweetFields%22%3Atrue%2C%22withBirdwatchNotes%22%3Atrue%2C%22withVoice%22%3Atrue%7D&features=%7B%22rweb_tipjar_consumption_enabled%22%3Atrue%2C%22responsive_web_graphql_exclude_directive_enabled%22%3Atrue%2C%22verified_phone_label_enabled%22%3Afalse%2C%22creator_subscriptions_tweet_preview_api_enabled%22%3Atrue%2C%22responsive_web_graphql_timeline_navigation_enabled%22%3Atrue%2C%22responsive_web_graphql_skip_user_profile_image_extensions_enabled%22%3Afalse%2C%22communities_web_enable_tweet_community_results_fetch%22%3Atrue%2C%22c9s_tweet_anatomy_moderator_badge_enabled%22%3Atrue%2C%22articles_preview_enabled%22%3Atrue%2C%22responsive_web_edit_tweet_api_enabled%22%3Atrue%2C%22graphql_is_translatable_rweb_tweet_is_translatable_enabled%22%3Atrue%2C%22view_counts_everywhere_api_enabled%22%3Atrue%2C%22longform_notetweets_consumption_enabled%22%3Atrue%2C%22responsive_web_twitter_article_tweet_consumption_enabled%22%3Atrue%2C%22tweet_awards_web_tipping_enabled%22%3Afalse%2C%22creator_subscriptions_quote_tweet_preview_enabled%22%3Afalse%2C%22freedom_of_speech_not_reach_fetch_enabled%22%3Atrue%2C%22standardized_nudges_misinfo%22%3Atrue%2C%22tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled%22%3Atrue%2C%22rweb_video_timestamps_enabled%22%3Atrue%2C%22longform_notetweets_rich_text_read_enabled%22%3Atrue%2C%22longform_notetweets_inline_media_enabled%22%3Atrue%2C%22responsive_web_enhance_cards_enabled%22%3Afalse%7D&fieldToggles=%7B%22withArticleRichContentState%22%3Atrue%2C%22withArticlePlainText%22%3Afalse%2C%22withGrokAnalyze%22%3Afalse%2C%22withDisallowedReplyControls%22%3Afalse%7D`,
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
      referrer: `${tweetUrl}`,
      referrerPolicy: "strict-origin-when-cross-origin",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "include",
    }
  ).then((response: Response) => {
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
  });

  // @ts-ignore
  return json;
};

const findTweetMedia = (tweetDetails: TweetDetails): Media[] => {
  const entry =
    tweetDetails.data.threaded_conversation_with_injections_v2.instructions[0]
      .entries[0];

  const result = entry.content.itemContent.tweet_results.result;

  if (result.legacy) {
    return result.legacy.entities.media;
  } else {
    return result.tweet.legacy.entities.media;
  }
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
): { user: string; tweetId: string } | null => {
  if (tweetUrl) {
    const match = tweetUrl.match(tweetUrlRegex);
    if (match) {
      console.log(match);
      return {
        user: match[1],
        tweetId: match[2],
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

const downloadTweetMedia = (tweet: HTMLElement): void => {
  const tweet_url = findTweetUrl(tweet)!;
  const { user, tweetId } = extractDataFromTweetUrl(tweet_url)!;
  console.log(user, tweetId);
  const tweetDetailsPromise = getTweetDetails(tweetId, tweet_url);
  tweetDetailsPromise.then((tweetDetails) => {
    const media_ = findTweetMedia(tweetDetails);

    for (let i = 0; i < media_.length; i++) {
      const media = media_[i];
      const type = media.type;
      console.log(type);

      if (type === "photo") {
        const photo_url = media.media_url_https;
        const large_photo_url =
          photo_url.split(".jpg")[0] + "?format=jpg&name=large";

        sendDownloadMessage(user, tweetId, i + 1, large_photo_url, "jpg");
      } else if (type === "video" || type === "animated_gif") {
        const video_variants = media.video_info.variants;
        // @ts-ignore
        const highest_bitrate = video_variants.reduce((prev, current) =>
          prev.bitrate > current.bitrate ? prev : current
        );
        console.log(highest_bitrate.url);
        sendDownloadMessage(user, tweetId, i + 1, highest_bitrate.url, "mp4");
      }
    }
  });
};

document.addEventListener("mousedown", (event: any) => {
  // const tweet = getTweetIfLiked(event.path); // event.path deprecated
  const tweet = getTweetIfLiked(event.composedPath());
  console.log(tweet);
  if (tweet) {
    downloadTweetMedia(tweet);
  }
});

// 2024-01-24: checking keypress when using twitter keybinds
document.addEventListener("keypress", (event: any) => {
  if (event.key === "l") {
    console.log("sanity check");
    console.log(
      document.activeElement?.querySelector("button[data-testid='like']")
    );
    console.log(document.activeElement);

    if (document.activeElement?.querySelector("button[data-testid='like']")) {
      console.log("sanity check 2");
      downloadTweetMedia(document.activeElement as HTMLElement);
      navigator.clipboard.writeText(
        (
          document.activeElement.querySelector("time")
            ?.parentElement as HTMLLinkElement
        ).href
      );
    }
  }
});
