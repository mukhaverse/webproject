// services/rxnormApi.js

const normalizeDrug = async (drugName) => {
  try {
    console.log("\n=== NORMALIZING:", drugName, "===");

    
    const rxcuiRes = await fetch(
      `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(drugName)}`
    );

    const rxcuiData = await rxcuiRes.json();

    console.log("RxCUI RESPONSE:", JSON.stringify(rxcuiData, null, 2));

    const rxcui = rxcuiData?.idGroup?.rxnormId?.[0];

    if (!rxcui) {
      console.log(" No RxCUI found");
      return drugName;
    }

    console.log(" RxCUI:", rxcui);

    // Get related info 
    const relatedRes = await fetch(
      `https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/related.json?tty=IN+BN`
    );

    //  log raw response
    const rawText = await relatedRes.text();
    console.log("RAW RELATED RESPONSE:", rawText);

    // try parsing
    let relatedData;
    try {
      relatedData = JSON.parse(rawText);
    } catch (err) {
      console.error(" JSON parse failed");
      return drugName;
    }

    console.log(
      "PARSED RELATED RESPONSE:",
      JSON.stringify(relatedData, null, 2)
    );

    //  Inspect groups
    const groups = relatedData?.relatedGroup?.conceptGroup || [];

    for (let group of groups) {
      console.log("GROUP TTY:", group.tty);

      const concepts = group.conceptProperties || [];

      for (let concept of concepts) {
        console.log("  →", concept.name);
      }
    }

    return drugName;

  } catch (error) {
    console.error("RxNorm error:", error);
    return drugName;
  }
};

module.exports = { normalizeDrug };