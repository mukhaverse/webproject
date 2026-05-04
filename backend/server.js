const express = require("express");
const cors = require("cors");
require("dotenv").config();

// import service
const { checkInteraction } = require("./services/interactionApi");
const { normalizeDrug } = require("./services/rxnormApi");

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("You're at MEDIXA server root!")
})


app.post("/check", async (req, res) => {
  const { drug1, drug2 } = req.body;

  if (!drug1 || !drug2) {

    return res.status(400).json({
      error: "drug1 and drug2 are required"
    })

  }

  try {

    const data = await checkInteraction(drug1, drug2)

    // const normalizedDrug1 = await normalizeDrug(drug1);
    // const normalizedDrug2 = await normalizeDrug(drug2);

    // console.log("Normalized:", normalizedDrug1, normalizedDrug2);

    // // call interaction API
    // const data = await checkInteraction(normalizedDrug1, normalizedDrug2);

    res.json(data)


  } catch (error) {

    console.error("ERROR:", error.message)

    res.status(500).json({
      error: "Failed to fetch interaction data"

    })
  }

})






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

    // debug (important for your testing)
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









const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log("listening at port 3000")

})