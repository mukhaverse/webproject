// ============================================================
//  backend/services/rxnormApi.js  (MODIFIED)
//
//  CHANGES FROM ORIGINAL:
//    1. Function signature now accepts an optional `db` param.
//       To keep backward compatibility, the existing /normalize
//       and /check routes don't need to change — they continue
//       to call normalizeDrug(drugName) with one argument and
//       the logging simply won't fire (db is undefined).
//
//    2. The /check route in server.js is updated to pass `db`
//       so failed normalizations get logged to unresolved_drugs.
//       See server.js modification instructions below.
//
//  HOW TO WIRE IT UP IN server.js:
//    Change the /check route's normalizeDrug calls from:
//      const normalizedDrug1 = await normalizeDrug(drug1);
//    To:
//      const normalizedDrug1 = await normalizeDrug(drug1, db);
//
//    That's the only server.js change beyond what's already
//    in the server.js file we delivered.
//
//  LOGIC:
//    - If normalization succeeds (returns a different name) → normal
//    - If it falls back to the original name → "normalization failed"
//    - On failure: check our local drug_mappings table first.
//      If found → use the admin's manual mapping instead.
//      If not found → log to unresolved_drugs for admin to resolve.
// ============================================================

const normalizeDrug = async (drugName, db = null) => {
  try {
    console.log("\n=== NORMALIZING:", drugName, "===");

    // ── Step 0: Check local admin mapping table first ────────
    // If an admin has already manually mapped this drug,
    // use their mapping and skip the API entirely.
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
        // Non-fatal: if DB lookup fails, continue to API
        console.warn(" Local mapping lookup failed:", dbErr.message);
      }
    }

    // ── Step 1: Get RxCUI ────────────────────────────────────
    const rxcuiRes = await fetch(
      `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(drugName)}`
    );
    const rxcuiData = await rxcuiRes.json();

    const rxcui = rxcuiData?.idGroup?.rxnormId?.[0];

    if (!rxcui) {
      console.log(" No RxCUI found — normalization failed");
      await logFailedNormalization(drugName, db);
      return drugName; // fallback to original
    }

    console.log(" RxCUI:", rxcui);

    // ── Step 2: Get generic name (IN type) ──────────────────
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

    // ── Fallback: no IN type found ───────────────────────────
    console.log(" No IN type found — normalization failed, using original");
    await logFailedNormalization(drugName, db);
    return drugName;

  } catch (error) {
    console.error("RxNorm error:", error);
    await logFailedNormalization(drugName, db);
    return drugName;
  }
};


// ── Helper: log a failed normalization to unresolved_drugs ───
//
// Uses INSERT IGNORE so if the same drug is checked multiple
// times while still pending, we don't create duplicate rows.
// Only logs when db is passed in (i.e. from the /check route).

async function logFailedNormalization(drugName, db) {
  if (!db) return; // db not provided — skip logging silently

  try {
    await db.promise().query(
      `INSERT IGNORE INTO unresolved_drugs (drug_name, status)
       VALUES (?, 'pending')
       ON DUPLICATE KEY UPDATE attempted_at = NOW()`,
      [drugName.trim()]
    );
    console.log(` Logged failed normalization: "${drugName}"`);
  } catch (err) {
    // Non-fatal — don't crash the check if logging fails
    console.warn(" Could not log failed normalization:", err.message);
  }
}


module.exports = { normalizeDrug };