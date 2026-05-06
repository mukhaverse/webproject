const normalizeDrug = async (drugName, db = null) => {
  try {
    console.log("\n=== NORMALIZING:", drugName, "===");

    // check local admin mapping table first
    // If an admin has already manually mapped this drug,
    // use their value and skip the RxNorm API entirely.
    if (db) {
      try {
        const [[mapping]] = await db.promise().query(
          "SELECT mapped FROM drug_mappings WHERE LOWER(original) = LOWER(?) LIMIT 1",
          [drugName.trim()]
        );

        if (mapping) {
          console.log(" Local mapping found:", mapping.mapped);
          return mapping.mapped;
        }
      } catch (dbErr) {
        // Non-fatal: if the DB lookup fails, continue to the API
        console.warn(" Local mapping lookup failed:", dbErr.message);
      }
    }

  
    
    const rxcuiRes = await fetch(
      `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(drugName)}`
    );
    const rxcuiData = await rxcuiRes.json();

    const rxcui = rxcuiData?.idGroup?.rxnormId?.[0];

    if (!rxcui) {
      console.log(" No RxCUI found, using original name:", drugName);
      return drugName;
    }

    console.log(" RxCUI:", rxcui);


    

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

    console.log(" No IN type found, using original name:", drugName);
    return drugName;

  } catch (error) {
    console.error("RxNorm error:", error);
    return drugName;
  }
};

module.exports = { normalizeDrug };