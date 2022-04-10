import fs from "fs";
import path from "path";
const folderAbsolutePath = process.argv[2];

const fileNameReplaceRegex =
  /^(.+)-([0-9]+)-([0-9]+_[0-9]+)-(img)([0-9]+)\.(.*)$/;

if (folderAbsolutePath) {
  const contents = fs.readdirSync(folderAbsolutePath);

  contents.forEach((fileName) => {
    if (fileName.endsWith("jpg") || fileName.endsWith("png")) {
      if (fileName.match(fileNameReplaceRegex)) {
        fs.renameSync(
          path.join(folderAbsolutePath, fileName),
          path.join(
            folderAbsolutePath,
            fileName.replace(fileNameReplaceRegex, "$2-$5.$6")
          )
        );
      }
    }
  });
}
