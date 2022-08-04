export function humanFileSize(bytes, si = false, dp = 1) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + " B";
  }

  const units = si ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"] : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

  return bytes.toFixed(dp) + " " + units[u];
}

export function bytesToShrink(value: number) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];
  let finalValue = 0;
  let finalUnit = sizes[0];
  let isNegative = value < 0;
  const _value = Math.abs(value);


  if (_value !== 0) {
    const i = parseInt(Math.floor(Math.log(_value) / Math.log(1024)).toString());

    if (i !== 0) {
      finalValue = _value / Math.pow(1024, i);
      finalUnit = sizes[i];
    }
  }

  return { value: isNegative ? -finalValue : finalValue, unit: finalUnit };
}
