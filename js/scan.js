const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const cameraBox = document.querySelector(".camera");
const ctx = canvas.getContext("2d");

canvas.width = video.videoWidth;
canvas.height = video.videoHeight;
ctx.drawImage(video, 0, 0);


async function openCamera() {
  let stream;
  try {
    
    stream = await navigator.mediaDevices.getUserMedia({
      //on
      video: true,
      //off
      audio: false
    });

    video.srcObject = stream;
    //remove the hidden
    cameraBox.style.display = "block";

    console.log("Camera opened");
  } catch (error) {
    console.error("Camera error:", error);
    alert("Camera could not be opened");
  }
}



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
