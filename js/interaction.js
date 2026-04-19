async function testOCR() {
  console.log("OCR started...");

    //TTESSSST OCR
  const result = await Tesseract.recognize(
    "https://tesseract.projectnaptha.com/img/eng_bw.png",
    "eng"
  );

  console.log("OCR RESULT:");
  console.log(result.data.text);

  alert("OCR finished. Check the console.");
}