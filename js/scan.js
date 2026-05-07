const video = document.getElementById("video");
const canvas = document.getElementById("scan");
const cameraBox = document.querySelector(".camera");
const captureBtn = document.querySelector(".take-but");
const closeBtn = document.querySelector(".close-but");
const scanBtn = document.querySelector(".scann");
const ctx = canvas.getContext("2d");



// const text ="";
let capturedImage = " ";


  //     Listeners
scanBtn.addEventListener("click",scan);
closeBtn.addEventListener("click",closeCamera);
captureBtn.addEventListener("click",capture);



function scan() {

  openCamera();
  video.style.display ="block";
  canvas.style.display ="none";
  captureBtn.style.display ="block";
  closeBtn.style.display ="block";

}


function closeCamera() {
  
  video.style.display ="none";
  canvas.style.display ="none";
  captureBtn.style.display ="none";
  closeBtn.style.display ="none";
  cameraBox.style.display = "none";
}



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
    //remove the hidd
    cameraBox.style.display = "flex";

    console.log("Camera opened");
  } catch (error) {
    console.error("Camera error:", error);
    alert("Camera could not be opened");
  }
}



function capture() {
  
  //only read content inside the frame
  const frame = document.querySelector(".scan-frame");

  const videoRect = video.getBoundingClientRect();
  const frameRect = frame.getBoundingClientRect();

  //for size
  const scaleX = video.videoWidth / videoRect.width;
  const scaleY = video.videoHeight / videoRect.height;

  const sx = (frameRect.left - videoRect.left) * scaleX;
  const sy = (frameRect.top - videoRect.top) * scaleY;
  const sw = frameRect.width * scaleX;
  const sh = frameRect.height * scaleY;

  canvas.width = sw;
  canvas.height = sh;

  ctx.filter = "grayscale(100%) contrast(180%)";
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, sw, sh);
  ctx.filter = "none";

  const image = canvas.toDataURL("image/png");
  readOCR(image);
}


 let scanCount =1;
async function readOCR(image) {

  try {

    //send the img to read it by Tesseract
    const result = await Tesseract.recognize(
      image,
      "eng"
    );

    //set all data coming from Tess
    let text = result.data.text;

    console.log("RAW OCR:", text);

    //clean 1
    text = text
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .trim();

    //read the firt line
    const firstLine = text.split("\n")[0];

    //clean 2
    const drugName = firstLine.trim();



    //retrive the drug name into the input
   document.getElementById(`drug${scanCount}`).value = drugName;
    scanCount++;



    // console.log("Drug Name:", drugName);
    // document.querySelector("#drugInput").value = drugName;

  } catch (error) {

    console.log("OCR ERROR:", error);

  }

}

