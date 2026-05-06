const normalizeDrug = async (drugName) => {
  try {
    console.log("\n=== NORMALIZING:", drugName, "===");

    // Step 1: Get RxCUI
    const rxcuiRes = await fetch(
      `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(drugName)}`
    );
    const rxcuiData = await rxcuiRes.json();

    const rxcui = rxcuiData?.idGroup?.rxnormId?.[0];

    if (!rxcui) {
      console.log(" No RxCUI found");
      return drugName;
    }

    console.log(" RxCUI:", rxcui);

    // Step 2: Get ONLY generic (IN)
    const relatedRes = await fetch(
      `https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/related.json?tty=IN`
    );

    const relatedData = await relatedRes.json();

    const groups = relatedData?.relatedGroup?.conceptGroup || [];

    for (let group of groups) {
      if (group.tty === "IN") {
        const concepts = group.conceptProperties || [];

        if (concepts.length > 0) {
          const genericName = concepts[0].name;

          console.log(" Normalized to:", genericName);
          return genericName;
        }
      }
    }

    console.log(" No IN found, fallback to original");
    return drugName;

  } catch (error) {
    console.error("RxNorm error:", error);
    return drugName;
  }
};

module.exports = { normalizeDrug };