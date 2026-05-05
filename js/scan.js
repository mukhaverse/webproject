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



// function capture(){

//   //take the same size of video
//   canvas.width = video.videoWidth;
//   canvas.height = video.videoHeight;

//   //draw the imge from video
//   ctx.drawImage(video, 0, 0,canvas.width, canvas.height);

//   video.style.display ="none";
//   canvas.style.display ="block";

//     //get the img
//   capturedImage = canvas.toDataURL("image/png");
//   console.log(capturedImage);
//   readOCR(capturedImage);

// }


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


// async function readOCR(image) {
//   try {
//     console.log("OCR started...");

//     const result = await Tesseract.recognize(
//       image,
//       "eng"
//     );

//      const text = result.data.text;

//     console.log("OCR RESULT:");
//     console.log(text);

//     //to clean data 
//     const drugName = extractDrugName(text);
//     console.log("Detected drug:", drugName);

//   } catch(error) {
//     console.log("ERROR OCR", error);
//   }
// }


// async function readOCR(image) {
//   const result = await Tesseract.recognize(image, "eng");

//   const text = result.data.text.toLowerCase();

//   const detected = extractDrugName(text);

//   const finalName = await normalizeDrugName(detected);

//   console.log("Detected:", detected);
//   console.log("Final for API:", finalName);
// }


// async function readOCR(image) {
//   const result = await Tesseract.recognize(image, "eng");

//   const text = result.data.text;

//   const drug = await findDrugFromText(text);

//   console.log("Detected drug:", drug);
// }


// async function normalizeDrugName(name) {
//   try {
//     const url = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:${name}&limit=1`;

//     const res = await fetch(url);
//     const data = await res.json();

//     const ingredient = data.results[0].active_ingredient[0];

//     return ingredient.split(" ")[0].toLowerCase();
//      console.log("The drug:", name);

//   } catch (error) {
//     console.log("API error");
//     return name; // fallback
//   }
// }

// async function findDrugFromText(text) {
//   const words = extractWords(text);

//   for (const word of words) {

//     const url = `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${word}`;

//     const res = await fetch(url);
//     const data = await res.json();

//     const rxcui = data.idGroup?.rxnormId?.[0];

//     if (rxcui) {
//       const propRes = await fetch(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/properties.json`);
//       const propData = await propRes.json();

//       return propData.properties.name;
//     }
//   }

//   return "No drug found";
// }



// function getDrugNameFromFirstLine(text) {
//   const lines = text
//     .split("\n")               
//     .map(line => line.trim())   
//     .filter(line => line.length > 2); 

//   return lines[0]; 
// }






  //change the content of the function to make sure take the correct drug name
// function extractWords(text) {
//   return text
//     .toLowerCase()
//     .replace(/[^a-z0-9\s]/g, "") 
//     .split(/\s+/)                
//     .filter(word => word.length > 3); 
// }






// async function testOCR() {

//   try{

//     console.log("OCR started...");

//         //TTESST OCR

//       const result = await Tesseract.recognize(
//         "../assets/panadol_box.png",
//         "eng"
//       );

//       console.log("OCR RESULT:");
//       console.log(result.data.text);

//       alert("OCR finished. Check the console.");

//   }
//    catch(error){
//      console.log("ERRROORR OCR"+error);
//   }
  
// }




// function getProductNameFromOCR(text) {
//   const lines = text
//     .split("\n")
//     .map(line => line.trim())
//     .filter(line => line.length > 2);

//  
//   return lines[0] || "No drug found";
// }


// async function readOCR(image) {
//   const result = await Tesseract.recognize(image, "eng");

//   const text = result.data.text;
//   console.log("OCR TEXT:", text);

//   const productName = getProductNameFromOCR(text);

//   console.log("Detected drug:", productName);
// }


// async function getDrugNameFromAPI(text) {
//   const lines = text
//     .split("\n")
//     .map(line => line.trim())
//     .filter(line => line.length > 2);

//   for (const line of lines) {
//     const url = `https://rxnav.nlm.nih.gov/REST/approximateTerm.json?term=${encodeURIComponent(line)}&maxEntries=3`;

//     const res = await fetch(url);
//     const data = await res.json();

//     const candidate = data.approximateGroup?.candidate?.[0];

//     if (!candidate) {
//       continue;
//     }

//     const propRes = await fetch(
//       `https://rxnav.nlm.nih.gov/REST/rxcui/${candidate.rxcui}/properties.json`
//     );

//     const propData = await propRes.json();

//     if (propData.properties?.name) {
//       return propData.properties.name;
//     }

//     if (candidate.name) {
//       return candidate.name;
//     }
//   }

//   return "No drug found";
// }


// function capture() {
//   canvas.width = video.videoWidth;
//   canvas.height = video.videoHeight;

//   ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

//   video.style.display = "none";
//   canvas.style.display = "block";

//   const image = canvas.toDataURL("image/png");

//   readOCR(image);
// }




function capture() {
  const videoWidth = video.videoWidth;
  const videoHeight = video.videoHeight;


  const cropX = 0;
  const cropY = 0;
  const cropWidth = videoWidth;
  const cropHeight = videoHeight * 0.35;

  canvas.width = cropWidth;
  canvas.height = cropHeight;

  ctx.filter = "grayscale(100%) contrast(200%)";
  ctx.drawImage(
    video,
    cropX, cropY, cropWidth, cropHeight,
    0, 0, cropWidth, cropHeight
  );
  ctx.filter = "none";

  video.style.display = "none";
  canvas.style.display = "block";

  const image = canvas.toDataURL("image/png");
  readOCR(image);
}



// async function readOCR(image) {
//   try {
//     console.log("OCR started...");

//     const result = await Tesseract.recognize(image, "eng", {
//       tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789- "
//     });

//     const text = result.data.text;
//     console.log("OCR TEXT:", text);

//     const drugName = getBestDrugName(text);
//     console.log("Detected drug:", drugName);

//   } catch (error) {
//     console.log("OCR error:", error);
//   }
// }


// function getBestDrugName(text) {
//   const badWords = [
//     "cough", "syrup", "tablets", "tablet", "capsules", "capsule",
//     "relief", "pain", "extract", "flavor", "mg", "ml", "dry",
//     "deficiencies", "chewable", "swallowable", "active", "ingredient"
//   ];

//   const lines = text
//     .split("\n")
//     .map(line => line.trim())
//     .filter(line => line.length > 2)
//     .map(line => line.replace(/[^a-zA-Z0-9\s-]/g, "").trim())
//     .filter(line => line.length > 2)
//     .filter(line => !badWords.some(word => line.toLowerCase().includes(word)));

//   if (lines.length === 0) {
//     return "No drug found";
//   }

  
//   lines.sort((a, b) => {
//     const upperA = (a.match(/[A-Z]/g) || []).length;
//     const upperB = (b.match(/[A-Z]/g) || []).length;
//     return upperB - upperA;
//   });

//   return lines[0];
// }