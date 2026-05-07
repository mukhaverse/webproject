const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./db");

// import service
const { checkInteraction } = require("./services/interactionApi");
const { normalizeDrug } = require("./services/rxnormApi");

const authRoutes  = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(express.json());
app.use(cors());

const path = require("path");
app.use(express.static(path.join(__dirname, "..")));



// /auth/signup, /auth/login, /auth/me, /auth/logout
app.use("/auth", authRoutes);

app.use("/admin", adminRoutes);




app.get("/", (req, res) => {
  res.send("You're at MEDIXA server root!")
})



db.query("SELECT 1", (err, result) => {
  if (err) console.error("DB test failed:", err);
  else console.log("DB working !");
});




app.post("/check", async (req, res) => {
  const { drug1, drug2 } = req.body;

  if (!drug1 || !drug2) {
    return res.status(400).json({
      error: "drug1 and drug2 are required"
    });
  }

  try {


    const normalizedDrug1 = await normalizeDrug(drug1, db);
    const normalizedDrug2 = await normalizeDrug(drug2, db);

    console.log("Normalized:", normalizedDrug1, normalizedDrug2);

    const data = await checkInteraction(normalizedDrug1, normalizedDrug2);

    // Detect "drug not found in database" from the interaction API response.

    if (data.message && data.message.includes("not found in database")) {
      // Figure out which drug the API rejected by checking
      // which normalized name appears in the message.
      const failedDrugs = [];
      
      if (data.message.toLowerCase().includes(normalizedDrug1.toLowerCase())) {
        failedDrugs.push({ original: drug1, normalized: normalizedDrug1 });
      }

      if (data.message.toLowerCase().includes(normalizedDrug2.toLowerCase())) {
        failedDrugs.push({ original: drug2, normalized: normalizedDrug2 });
      }

      
      if (failedDrugs.length === 0) {
        failedDrugs.push(
          { original: drug1, normalized: normalizedDrug1 },
          { original: drug2, normalized: normalizedDrug2 }
        );
      }

      for (const failed of failedDrugs) {
        db.query(
          `INSERT INTO unresolved_drugs (drug_name, status)
           VALUES (?, 'pending')
           ON DUPLICATE KEY UPDATE attempted_at = NOW()`,
          [failed.original],
          (err) => {
            if (err) console.error("[DB] Failed to log unresolved drug:", err.message);
            else console.log(`[Mapping] Logged unresolved drug: "${failed.original}"`);
          }
        );
      }
    }



    //shumokh i added that to insert interaction info
    const interaction = data.interaction;

        if (!interaction) {
          return res.json(data);
        }
    const sql = `INSERT INTO interaction_checks
     (drug1, drug2 ,severity, description, management, clinical_significance) VALUES (?,?,?,?,?,?)`;

     
    db.query(sql, [
      normalizedDrug1,
      normalizedDrug2,
      data.interaction.severity,
      data.interaction.description,
      data.interaction.management,
      data.interaction.clinical_significance
    ], (error) => {
      if (error) {
        console.log("Error during insert inf of interaction");
      }
    });

    res.json(data);

  } catch (error) {
    console.error("ERROR:", error.message);
    res.status(500).json({
      error: "Failed to fetch interaction data"
    });
  }

});



                              // #### endpoint for interaction ####

app.get("/interaction", async (req, res) => {

  db.query(
    `SELECT id, drug1, drug2 ,severity ,description , management, clinical_significance, created_at 
    FROM interaction_checks 
     ORDER BY created_at DESC `,
    (err, results) => {
      if (err) {
        console.error("DB ERROR:", err);
        return res.status(404).json({ error: "occure during get interaction from DB" });
      }
      res.json(results);
    }
  );

});




app.get("/search", async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({
      error: "query is required"
    });
  }

  try {
    const response = await fetch(
      `https://drug-interaction-checker.p.rapidapi.com/drugs/search?q=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
          "X-RapidAPI-Host": process.env.RAPIDAPI_HOST
        }
      }
    );

    const rawText = await response.text();
    console.log("RAW SEARCH RESPONSE:", rawText);

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      return res.status(500).json({
        error: "Failed to parse API response"
      });
    }

    res.json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Search request failed"
    });
  }
});




app.post("/normalize", async (req, res) => {
  const { drugs } = req.body;

  if (!drugs || !Array.isArray(drugs)) {
    return res.status(400).json({
      error: "drugs must be an array"
    });
  }

  try {
    const results = [];

    for (let drug of drugs) {
      const normalized = await normalizeDrug(drug);

      results.push({
        original: drug,
        normalized: normalized
      });
    }

    res.json({
      count: results.length,
      results
    });

  } catch (error) {
    console.error("NORMALIZE ERROR:", error.message);

    res.status(500).json({
      error: "Normalization failed"
    });
  }
});









app.post("/testimonials", (req, res) => {
  const { name, message } = req.body;

  if (!name || !message) {
    return res.status(400).json({ error: "All fields required" });
  }

  const sql = "INSERT INTO testimonials (name, message) VALUES (?, ?)";

  db.query(sql, [name, message], (err, result) => {
    if (err) {
      console.error("DB ERROR:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json({ success: true });
  });
});


app.get("/testimonials", (req, res) => {
  db.query(
    "SELECT id, name, message, created_at FROM testimonials ORDER BY created_at DESC",
    (err, results) => {
      if (err) {
        console.error("DB ERROR:", err);
        return res.status(500).json({ error: "Database error" });
      }

      res.json(results);
    }
  );
});




const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log("listening at port 3000")

})