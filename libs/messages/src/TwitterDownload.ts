export interface AruMessage {
  name: string;
  payload: any;
}

export const TwitterDownload = {
  name: "TwitterDownload",
  generateMessage: (url: string, artist: string): AruMessage => {
    return {
      name: "TwitterDownload",
      payload: {
        url,
        artist,
      },
    };
  },
};
