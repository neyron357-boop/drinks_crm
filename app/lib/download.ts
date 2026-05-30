export type DownloadFile = {
  blob: Blob;
  fileName: string;
};

export function downloadBlob(blob: Blob, fileName: string) {
  const legacyNavigator = window.navigator as Navigator & {
    msSaveOrOpenBlob?: (blob: Blob, fileName: string) => boolean;
  };

  if (legacyNavigator.msSaveOrOpenBlob) {
    legacyNavigator.msSaveOrOpenBlob(blob, fileName);
    return;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.rel = "noopener";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();

  window.setTimeout(() => {
    link.remove();
    URL.revokeObjectURL(url);
  }, 60000);
}
