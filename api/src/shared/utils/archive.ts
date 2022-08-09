import fs from "fs";
import lz4 from "lz4";
import { extract } from "tar";
import progress from "progress-stream";
import { round } from "@src/shared/utils/math";
import { getPrettyTime } from "@src/shared/utils/date";

export async function extractLz4(localArchivePath: string, outputFilePath: string): Promise<void> {
  return new Promise<void>(function (resolve, reject) {
    const decoder = lz4.createDecoderStream();
    const input = fs.createReadStream(localArchivePath);
    const output = fs.createWriteStream(outputFilePath);
    const progressStream = progress({
      length: fs.statSync(localArchivePath).size,
      time: 1_000
    });

    progressStream.on("progress", (progress) =>
      console.log(`Extracting lz4 file: ${round(progress.percentage, 2)}% remaining: ${getPrettyTime(progress.eta * 1_000)}`)
    );

    input
      .pipe(progressStream)
      .pipe(decoder)
      .pipe(output)
      .on("finish", () => resolve())
      .on("error", (err) => reject(err));
  });
}

export async function extractTar(localArchivePath: string, outputPath: string) {
  return new Promise<void>(function (resolve, reject) {
    const input = fs.createReadStream(localArchivePath);
    const output = extract({ cwd: outputPath });

    const progressStream = progress({
      length: fs.statSync(localArchivePath).size,
      time: 1_000
    });

    progressStream.on("progress", (progress) =>
      console.log(`Extracting tar file: ${round(progress.percentage, 2)}% remaining: ${getPrettyTime(progress.eta * 1_000)}`)
    );

    input
      .pipe(progressStream)
      .pipe(output)
      .on("finish", () => resolve())
      .on("error", (err) => reject(err));
  });
}
