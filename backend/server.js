const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
require("dotenv").config();
const db = require("./db");


                              //  ###### SOOCCKETT #######

// let socketConnected = new Set();

// io.on("connection",(socket) => {

//   // "on" 
//   socket.on("Send-message",(data) => {
//     io.emit("receive-message",data );
//     console.log(data+"IS RECEIVED");
//   })




// });



// function onConnected(socket){
//  console.log("SOOCKET CONNECTED");
//   socketConnected.add(socket.id);
//   //treger for each conn
//   io.emit('Clients-total', socketConnected.size);



  // socket.on("disconnect" ,() => {
  // console.log("SOOCKET DISS-CONNECTED");
  // socketConnected.delete(socket.id);
  // io.emit('Clients-total', socketConnected.size);
  // })

// }


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


//schedule recommendation logic
function getSeverityRank(severity) {
  const value = String(severity || "").toLowerCase();

  if (value.includes("contraindicated")) return 4;
  if (value.includes("major")) return 3;
  if (value.includes("moderate")) return 2;
  if (value.includes("minor")) return 1;

  return 0;
}

function getHighestSeverity(results) {
  let highest = {
    severity: "none",
    rank: 0
  };

  results.forEach(item => {
    const severity = item.result?.interaction?.severity;
    const rank = getSeverityRank(severity);

    if (rank > highest.rank) {
      highest = {
        severity,
        rank
      };
    }
  });

  return highest;
}


function formatHour(hour) {
  const normalized = ((hour % 24) + 24) % 24;
  const suffix = normalized < 12 ? "am" : "pm";
  const hour12 = normalized % 12 === 0 ? 12 : normalized % 12;

  return `${hour12.toString().padStart(2, "0")} ${suffix}`;
}

function getDrugColors(count) {
  const colors = [
    "pink",
    "yellow",
    "blue",
    "orange",
    "green",
    "purple",
    "cyan"
  ];

  return colors.slice(0, count);
}



function getScheduleRule(rank) {
  if (rank === 1) {
    return {
      canSchedule: true,
      gapHours: 2,
      message:
        "Minor interaction: spacing medications by 1–4 hours is usually enough because the issue is often absorption-based."
    };
  }

  if (rank === 2) {
    return {
      canSchedule: true,
      gapHours: 4,
      message:
        "Moderate interaction: spacing medications by 2–4 hours may help when the issue is absorption or binding-related."
    };
  }

  if (rank === 3) {
    return {
      canSchedule: false,
      gapHours: null,
      message:
        "Major interaction: no fixed time interval can reliably make this combination safe. Timing alone does not resolve this interaction."
    };
  }

  if (rank === 4) {
    return {
      canSchedule: false,
      gapHours: null,
      message:
        "Contraindicated interaction: no safe interval exists. This medication combination should be avoided entirely."
    };
  }

  return {
    canSchedule: false,
    gapHours: null,
    message: "No schedule recommendation available."
  };
}

function buildScheduleRecommendation(normalizedDrugs, results) {
  const highest = getHighestSeverity(results);

  if (highest.rank === 0) {
    return {
      show: false
    };
  }

  const rule = getScheduleRule(highest.rank);

  if (!rule.canSchedule) {
    return {
      show: true,
      canSchedule: false,
      severity: highest.severity,
      message: rule.message
    };
  }

  const colors = getDrugColors(normalizedDrugs.length);
  const startHour = 8;

  const scheduleData = normalizedDrugs.map((drug, index) => {
    const time = formatHour(
      startHour + index * rule.gapHours
    );

    return {
      drug: drug.normalized,
      time,
      color: colors[index] || "green"
    };
  });

  return {
    show: true,
    canSchedule: true,
    severity: highest.severity,
    message: rule.message,
    gapHours: rule.gapHours,
    scheduleData
  };
}



                  //############ array of drugs ########
app.post("/check", async (req, res) => {
  const { drugs } = req.body;

  if (!drugs || !Array.isArray(drugs) || drugs.length < 2) {
    return res.status(400).json({
      error: "Please provide at least two drugs"
    });
  }

  try {
    const normalizedDrugs = [];

    for (const drug of drugs) {
      const normalized = await normalizeDrug(drug, db);

      normalizedDrugs.push({
        original: drug,
        normalized: normalized
      });
    }

    const results = [];

    for (let i = 0; i < normalizedDrugs.length; i++) {
      for (let j = i + 1; j < normalizedDrugs.length; j++) {
        const drugA = normalizedDrugs[i];
        const drugB = normalizedDrugs[j];

        const data = await checkInteraction(drugA.normalized, drugB.normalized);

        if (data.message && data.message.includes("not found in database")) {
          const failedDrugs = [];

          if (data.message.toLowerCase().includes(drugA.normalized.toLowerCase())) {
            failedDrugs.push(drugA);
          }

          if (data.message.toLowerCase().includes(drugB.normalized.toLowerCase())) {
            failedDrugs.push(drugB);
          }

          if (failedDrugs.length === 0) {
            failedDrugs.push(drugA, drugB);
          }

          for (const failed of failedDrugs) {
            db.query(
              `INSERT INTO unresolved_drugs (drug_name, status)
               VALUES (?, 'pending')
               ON DUPLICATE KEY UPDATE attempted_at = NOW()`,
              [failed.original],
              (err) => {
                if (err) {
                  console.error("[DB] Failed to log unresolved drug:", err.message);
                }
              }
            );
          }
        }

        if (data.interaction) {
          const interaction = data.interaction;

          const sql = `
            INSERT INTO interaction_checks
            (drug1, drug2, severity, description, management, clinical_significance)
            VALUES (?, ?, ?, ?, ?, ?)
          `;

          db.query(sql, [
            drugA.normalized,
            drugB.normalized,
            interaction.severity,
            interaction.description,
            interaction.management,
            interaction.clinical_significance
          ], (error) => {
            if (error) {
              console.log("Error during insert info of interaction:", error);
            }
          });
        }

        results.push({
          drug1: drugA,
          drug2: drugB,
          result: data
        });
      }
    }

    const scheduleRecommendation =
      buildScheduleRecommendation(
        normalizedDrugs,
        results
      );

    res.json({
      count: results.length,
      results: results,
      scheduleRecommendation
    });

  } catch (error) {
    console.error("ERROR:", error.message);

    res.status(500).json({
      error: "Failed to fetch interaction data"
    });
  }
});





  //###############################

// app.post("/check", async (req, res) => {
//   const { drug1, drug2 } = req.body;


//   // if (!drug1 || !drug2) {
//   //   return res.status(400).json({
//   //     error: "drug1 and drug2 are required"
//   //   });
//   // }

//   try {
//       // to changed to make check multiy drugs

//     const normalizedDrug1 = await normalizeDrug(drug1, db);
//     const normalizedDrug2 = await normalizeDrug(drug2, db);

//     console.log("Normalized:", normalizedDrug1, normalizedDrug2);

//     const data = await checkInteraction(normalizedDrug1, normalizedDrug2);

//     // Detect "drug not found in database" from the interaction API response.

//     if (data.message && data.message.includes("not found in database")) {
//       // Figure out which drug the API rejected by checking
//       // which normalized name appears in the message.
//       const failedDrugs = [];
      
//       if (data.message.toLowerCase().includes(normalizedDrug1.toLowerCase())) {
//         failedDrugs.push({ original: drug1, normalized: normalizedDrug1 });
//       }

//       if (data.message.toLowerCase().includes(normalizedDrug2.toLowerCase())) {
//         failedDrugs.push({ original: drug2, normalized: normalizedDrug2 });
//       }

      
//       if (failedDrugs.length === 0) {
//         failedDrugs.push(
//           { original: drug1, normalized: normalizedDrug1 },
//           { original: drug2, normalized: normalizedDrug2 }
//         );
//       }


//       for (const failed of failedDrugs) {
//         db.query(
//           `INSERT INTO unresolved_drugs (drug_name, status)
//            VALUES (?, 'pending')
//            ON DUPLICATE KEY UPDATE attempted_at = NOW()`,
//           [failed.original],
//           (err) => {
//             if (err) console.error("[DB] Failed to log unresolved drug:", err.message);
//             else console.log(`[Mapping] Logged unresolved drug: "${failed.original}"`);
//           }
//         );
//       }
//     }



//     //shumokh i added that to insert interaction info
//     const interaction = data.interaction;

//         if (!interaction) {
//           return res.json(data);
//         }
//     const sql = `INSERT INTO interaction_checks
//      (drug1, drug2 ,severity, description, management, clinical_significance) VALUES (?,?,?,?,?,?)`;

     
//     db.query(sql, [
//       normalizedDrug1,
//       normalizedDrug2,
//       data.interaction.severity,
//       data.interaction.description,
//       data.interaction.management,
//       data.interaction.clinical_significance
//     ], (error) => {
//       if (error) {
//         console.log("Error during insert inf of interaction");
//       }
//     });

//     res.json(data);

//   } catch (error) {
//     console.error("ERROR:", error.message);
//     res.status(500).json({
//       error: "Failed to fetch interaction data"
//     });
//   }

// });



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

const server = app.listen(PORT, () => {
  console.log(`listening at port ${PORT}`);
});


                                      //  ###### SOOCCKETT #######
const io = new Server(server);                                      
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join-chat", (chatId) => {
    socket.join(chatId);
    console.log(`Socket ${socket.id} joined chat ${chatId}`);
  });

  socket.on("send-message", (data) => {
    console.log("Message received:", data);

    io.to(data.chatId).emit("receive-message", data);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});