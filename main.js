const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const canvasCopy = document.createElement("canvas");
var img = new Image();

var fileSelector = document.getElementById("fileSelector");
var flipButton = document.getElementById("flipImage");
var removeBackgroundButton = document.getElementById("removeBackground");
var blackAndWhiteButton = document.getElementById("blackAndWhite");
var changeSaturationSlider = document.getElementById("saturationSlider");
var cropImageButton = document.getElementById("cropImage");
var resizeButton = document.getElementById("resizeImage");
var exportButton = document.getElementById("exportImage");

var cc = document.querySelectorAll(".rgb");
var picked = document.querySelector("#picked");


fileSelector.addEventListener("change", (e) => displayImage());
flipButton.addEventListener("click", (e) => flipImage());
removeBackgroundButton.addEventListener("click", (e) => removeBackground());
blackAndWhiteButton.addEventListener("click", (e) => blackAndWhite());
changeSaturationSlider.addEventListener("change", (e) => changeSaturation());
cropImageButton.addEventListener("click", (e) => cropImage());
exportButton.addEventListener("click", (e) => exportImage());
resizeButton.addEventListener("click", (e) => resizeImage());



// file read:
//     1. reader create
//     2. read a file.
//     3. define what to do after reading:
//         1. image creation
//         2. load the file data into the image. // load in background
//         3. define what to do after loading:
//             1. set the height and width of canvas to image's height and width.
//             2. canvas lo image ni load chestam.

function displayImage() {

  // Check if a file is selected
  if (fileSelector.files && fileSelector.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const i = new Image();
      i.src = e.target.result;
      i.crossOrigin = "Anonymous";
      i.onload = () => {
        canvas.width = i.width;
        canvas.height = i.height;

        ctx.drawImage(i, 0, 0);

        canvasCopy.width = i.width;
        canvasCopy.height = i.height;
        canvasCopy.getContext("2d").drawImage(i, 0, 0);

        img = i;
      };
    };
    reader.readAsDataURL(fileSelector.files[0]);
  }
}

canvas.addEventListener("mousemove", (e) => {
  const clickX = e.offsetX;
  const clickY = e.offsetY;

  const pixel = ctx.getImageData(clickX, clickY, canvas.width, canvas.height);

  const r = pixel.data[0];
  const g = pixel.data[1];
  const b = pixel.data[2];
  cc[0].innerText = r;
  cc[1].innerText = g;
  cc[2].innerText = b;
  picked.style.backgroundColor = `rgb(${r},${g},${b})`;
});

function flipImage(e) {
  ctx.putImageData(swapAndFlipPixels(canvas), 0, 0);
}

function swapAndFlipPixels(image) {
  const flippedImageData = ctx.createImageData(image.width, image.height);
  const originalData = ctx.getImageData(0, 0, image.width, image.height).data;

  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      // Loop through entire width

      // Calculate flipped pixel coordinates
      const flippedX = image.width - 1 - x;
      const flippedY = y;

      // Get original pixel data indices based on RGBA channels (assuming 4 bytes per pixel)
      const originalIndex = (y * image.width + x) * 4;
      const flippedIndex = (flippedY * image.width + flippedX) * 4;

      // Swap pixel data (RGBA channels)
      flippedImageData.data[flippedIndex] = originalData[originalIndex];
      flippedImageData.data[flippedIndex + 1] = originalData[originalIndex + 1];
      flippedImageData.data[flippedIndex + 2] = originalData[originalIndex + 2];
      flippedImageData.data[flippedIndex + 3] = originalData[originalIndex + 3];
    }
  }

  return flippedImageData;
}

function removeBackground() {
  const firstPixel = canvas
    .getContext("2d")
    .getImageData(0, 0, canvas.width, canvas.height);

  const newImageData = canvas
    .getContext("2d")
    .getImageData(0, 0, canvas.width, canvas.height);
  const originalData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      // Get original pixel data indices based on RGBA channels (assuming 4 bytes per pixel)
      const originalIndex = (y * canvas.width + x) * 4;

      const threshold = 15;

      if (
        originalData[originalIndex] < firstPixel.data[0] + threshold &&
        originalData[originalIndex] > firstPixel.data[0] - threshold &&
        originalData[originalIndex + 1] < firstPixel.data[1] + threshold &&
        originalData[originalIndex + 1] > firstPixel.data[1] - threshold &&
        originalData[originalIndex + 2] < firstPixel.data[2] + threshold &&
        originalData[originalIndex + 2] > firstPixel.data[2] - threshold &&
        originalData[originalIndex + 3] < firstPixel.data[3] + threshold &&
        originalData[originalIndex + 3] > firstPixel.data[3] - threshold
      ) {
        newImageData.data[originalIndex] = 0;
        newImageData.data[originalIndex + 1] = 0;
        newImageData.data[originalIndex + 2] = 0;
        newImageData.data[originalIndex + 3] = 0;
      }
    }
  }

  ctx.putImageData(newImageData, 0, 0);
}

// Function to convert the image to black and white
// 1. Read the original Image data.
// 2. create a new image to store the black and white version
// 3. calculate the gray scale
//      1. read the original image's rgb values of a pixel
//      2. calculate the grayscale using formula.
// 4. assign this grayscale to the same pixel but in the newimage.
// 5. assign the newImage to the canvas.

function blackAndWhite() {
  const image = canvas;
  const newImageData = ctx.createImageData(image.width, image.height);
  const originalData = image
    .getContext("2d")
    .getImageData(0, 0, image.width, image.height).data;

  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      // Get original pixel data indices based on RGBA channels (assuming 4 bytes per pixel)
      const originalIndex = (y * image.width + x) * 4;
      const grayscale =
        originalData[originalIndex] * 0.3 +
        originalData[originalIndex + 1] * 0.59 +
        originalData[originalIndex + 2] * 0.11;

      // Swap pixel data (RGBA channels)
      newImageData.data[originalIndex] = grayscale;
      newImageData.data[originalIndex + 1] = grayscale;
      newImageData.data[originalIndex + 2] = grayscale;
      newImageData.data[originalIndex + 3] = 255;
    }
  }
  ctx.putImageData(newImageData, 0, 0);
}

function changeSaturation() {
  const saturationLevel = changeSaturationSlider.value;
  const image = canvas;
  const originalData = canvasCopy
    .getContext("2d")
    .getImageData(0, 0, image.width, image.height).data;
  const saturatedImageData = ctx.createImageData(image.width, image.height);

  //   for (let y = 0; y < image.height; y++) {
  //     for (let x = 0; x < image.width; x++) {

  //       const originalIndex = (y * image.width + x) * 4;
  //       const red = originalData[originalIndex];
  //       const green = originalData[originalIndex + 1];
  //       const blue = originalData[originalIndex + 2];
  //       const gray = red * 0.2126 + green * 0.7152 + blue * 0.0722;

  //       const delta = Math.abs(gray - red) + Math.abs(gray - green) + Math.abs(gray - blue);

  //       // Adjust saturation based on saturationLevel (positive for increase, negative for decrease)
  //       const newRed = red + (saturationLevel * delta * (red - gray)) / 255;
  //       const newGreen = green + (saturationLevel * delta * (green - gray)) / 255;
  //       const newBlue = blue + (saturationLevel * delta * (blue - gray)) / 255;

  //       //console.log(Math.max(0, Math.min(255, newRed)), Math.max(0, Math.min(255, newGreen)), Math.max(0, Math.min(255, newBlue)));

  //       flippedImageData.data[originalIndex] = Math.max(0, Math.min(255, newRed));
  //       flippedImageData.data[originalIndex + 1] = Math.max(0, Math.min(255, newGreen));
  //       flippedImageData.data[originalIndex + 2] = Math.max(0, Math.min(255, newBlue));
  //     }
  //   }

  for (let i = 0; i < originalData.length; i += 4) {
    const red = originalData[i];
    const green = originalData[i + 1];
    const blue = originalData[i + 2];
    const gray = red * 0.2126 + green * 0.7152 + blue * 0.0722;

    const delta =
      Math.abs(gray - red) + Math.abs(gray - green) + Math.abs(gray - blue);

    // Adjust saturation based on saturationLevel (positive for increase, negative for decrease)
    const newRed = red + (saturationLevel * delta * (red - gray)) / 255;
    const newGreen = green + (saturationLevel * delta * (green - gray)) / 255;
    const newBlue = blue + (saturationLevel * delta * (blue - gray)) / 255;
    //console.log(Math.max(0, Math.min(255, newRed)), Math.max(0, Math.min(255, newGreen)), Math.max(0, Math.min(255, newBlue)));

    // Clamp new color values to 0-255 range
    saturatedImageData.data[i] = Math.max(0, Math.min(255, newRed));
    saturatedImageData.data[i + 1] = Math.max(0, Math.min(255, newGreen));
    saturatedImageData.data[i + 2] = Math.max(0, Math.min(255, newBlue));
    saturatedImageData.data[i + 3] = 255;

    // Alpha channel remains unchanged (set to 255 for full opacity)
  }

  ctx.putImageData(saturatedImageData, 0, 0);
  //canvas.draw()
}

function exportImage() {
  const dataURL = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = dataURL;
  link.download = "editedImage.png";
  link.click();
}

function cropImage() {
  const cropSize = Math.min(canvas.width, canvas.height);
  ctx.drawImage(
    img,
    (img.width - cropSize) / 2,
    (img.height - cropSize) / 2,
    cropSize,
    cropSize,
    0,
    0,
    canvas.width,
    canvas.height
  );
}

function resizeImage() {
  canvas.width = img.width / 2;
  canvas.height = img.height / 2;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.width);
}
