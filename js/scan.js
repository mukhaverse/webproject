const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = video.videoWidth;
canvas.height = video.videoHeight;

ctx.drawImage(video, 0, 0);


async function testOCR() {
  console.log("OCR started...");

    //TTESST OCR

  const result = await Tesseract.recognize(
    "../assets/panadol_box.png",
    "eng"
  );

  console.log("OCR RESULT:");
  console.log(result.data.text);

  alert("OCR finished. Check the console.");
}
