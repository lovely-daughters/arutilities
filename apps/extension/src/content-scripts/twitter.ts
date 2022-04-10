import { TwitterDownload } from "@aru/messages/src/TwitterDownload";

let scrolling = false;
let likeButtons = document.querySelectorAll('div[data-testid="like"]');

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
    const descendantImages = tweetElement.querySelectorAll(
      'img[alt="Image"].css-9pa8cd'
    );
    console.log(descendantImages);

    descendantImages.forEach((image) => {
      const src = image.getAttribute("src");
      if (src) {
        chrome.runtime.sendMessage(
          TwitterDownload.generateMessage(src, "test")
        );
        console.log("message sent");
      }
    });
  }

  // const ancestor: HTMLElement = event.path[9];
  // console.log(ancestor);
  // console.log(descendantImages);
  // const lastImage = descendantImages[descendantImages.length - 1];
  // if (
  //   lastImage &&
  //   lastImage.getAttribute("alt") === "Image" &&
  //   lastImage.getAttribute("class") === "css-9pa8cd"
  // ) {
  //   const src = lastImage.getAttribute("src");
  //   console.log(src);
  // }
});

// likeButtons.forEach((likeButton) => {
//   likeButton.addEventListener("mousedown", (event) => {
//     console.log(event.target);
//   });
// });

// window.onscroll = function () {
//   scrolling = true;
// };

// const timer = setInterval(() => {
//   scrolling = false;
// }, 1000);

// setInterval(() => {
//   console.log(scrolling);
//   if (scrolling) {
//     likeButtons = document.querySelectorAll('div[data-testid="like"]');
//     console.log(likeButtons);
//   }
// }, 250);
