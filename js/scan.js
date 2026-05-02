const video = document.getElementById("video");
const canvas = document.getElementById("scan");
const cameraBox = document.querySelector(".camera");
const captureBtn = document.querySelector(".take-but");
const closeBtn = document.querySelector(".close-but");
const scanBtn = document.querySelector(".scann");
const ctx = canvas.getContext("2d");


scanBtn.addEventListener("click",scan);
closeBtn.addEventListener("click",closeCamera);
captureBtn.addEventListener("click",capture);



function scan() {
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
}

function capture(){

  //take the same size of video
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  //draw the imge from video
  ctx.drawImage(video, 0, 0,canvas.width, canvas.height);

  video.style.display ="none";
  canvas.style.display ="block";


  const image = canvas.toDataURL("image/png");
  console.log(image);

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
    cameraBox.style.display = "block";

    console.log("Camera opened");
  } catch (error) {
    console.error("Camera error:", error);
    alert("Camera could not be opened");
  }
}


async function testOCR() {

  try{

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
   catch(error){
     console.log("ERRROORR OCR");
  }
  
}
