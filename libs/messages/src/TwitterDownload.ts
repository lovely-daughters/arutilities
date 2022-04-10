export interface AruMessage<PayloadType> {
  name: string;
  payload: PayloadType;
}

export interface DownloadPayload {
  url: string;
  filename: string;
}

export const Download = {
  name: "Download",
  generateMessage: (
    url: string,
    filename: string
  ): AruMessage<DownloadPayload> => {
    return {
      name: "Download",
      payload: {
        url,
        filename,
      },
    };
  },
};
export interface TwitterDownloadPayload {
  user: string;
  status: string;
  index: number;
  src: string;
  ext: string;
}

export const TwitterDownload = {
  name: "TwitterDownload",
  generateMessage: (
    user: string,
    status: string,
    index: number,
    src: string,
    ext: string
  ): AruMessage<TwitterDownloadPayload> => {
    return {
      name: "TwitterDownload",
      payload: {
        user,
        status,
        index,
        src,
        ext,
      },
    };
  },
};
