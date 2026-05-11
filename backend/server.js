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
const { requireAuth } = require("./middleware/auth");
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



                                // ####### user endpoint for messages #####
                 
                                
                      // get current user conversations

app.get("/chat/conversations", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.promise().query(
      `SELECT
         cc.id,
         cc.user_id,
         cc.created_at,
         cc.updated_at,
         (
           SELECT body
           FROM chat_messages
           WHERE conversation_id = cc.id
           ORDER BY sent_at DESC
           LIMIT 1
         ) AS last_message
       FROM chat_conversations cc
       WHERE cc.user_id = ?
       ORDER BY cc.updated_at DESC`,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("[CHAT] conversations error:", err.message);
    res.status(500).json({ error: "Failed to load conversations" });
  }
});


              // start new chat with first message

app.post("/chat/start", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { body } = req.body;

  if (!body || !body.trim()) {
    return res.status(400).json({ error: "Message body is required" });
  }

  const conn = await db.promise().getConnection();

  try {
    await conn.beginTransaction();

    const [chatResult] = await conn.query(
      "INSERT INTO chat_conversations (user_id) VALUES (?)",
      [userId]
    );

    const conversationId = chatResult.insertId;

    const [msgResult] = await conn.query(
      `INSERT INTO chat_messages
       (conversation_id, sender_id, sender_role, body)
       VALUES (?, ?, 'user', ?)`,
      [conversationId, userId, body.trim()]
    );

    await conn.query(
      "UPDATE chat_conversations SET updated_at = NOW() WHERE id = ?",
      [conversationId]
    );

    await conn.commit();

    res.status(201).json({
      conversationId,
      message: {
        id: msgResult.insertId,
        conversation_id: conversationId,
        sender_id: userId,
        sender_role: "user",
        body: body.trim(),
        sent_at: new Date().toISOString()
      }
    });

  } catch (err) {
    await conn.rollback();
    console.error("[CHAT] start error:", err.message);
    res.status(500).json({ error: "Failed to start chat" });
  } finally {
    conn.release();
  }
});



          // get messages for user conversation

app.get("/chat/conversations/:id/messages", requireAuth, async (req, res) => {
  const convId = parseInt(req.params.id, 10);

  if (isNaN(convId)) {
    return res.status(400).json({ error: "Invalid conversation ID" });
  }

  try {

    // mark messages as read
    await db.promise().query(
      `UPDATE chat_messages
       SET is_read = 1
       WHERE conversation_id = ? AND sender_role = 'user'`,
      [convId]
    );

    // get chat info + user name
    const [[chat]] = await db.promise().query(
      `SELECT
         cc.id,
         cc.user_id,
         cc.created_at,
         cc.updated_at,
         u.name AS user_name
       FROM chat_conversations cc
       JOIN users u ON u.id = cc.user_id
       WHERE cc.id = ?`,
      [convId]
    );

    if (!chat) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // get messages
    const [messages] = await db.promise().query(
      `SELECT
         cm.id,
         cm.body,
         cm.sender_role,
         cm.is_read,
         cm.sent_at,
         u.name AS sender_name
       FROM chat_messages cm
       JOIN users u ON u.id = cm.sender_id
       WHERE cm.conversation_id = ?
       ORDER BY cm.sent_at ASC`,
      [convId]
    );

    return res.json({
      chat,
      messages
    });

  } catch (err) {
    console.error("[Admin] /chat/messages GET error:", err.message);

    return res.status(500).json({
      error: "Failed to load messages"
    });
  }
});



          // send user message in existing chat

app.post("/chat/conversations/:id/messages", requireAuth, async (req, res) => {
  const conversationId = parseInt(req.params.id, 10);
  const userId = req.user.id;
  const { body } = req.body;

  if (isNaN(conversationId)) {
    return res.status(400).json({ error: "Invalid conversation ID" });
  }

  if (!body || !body.trim()) {
    return res.status(400).json({ error: "Message body is required" });
  }

  try {
    const [[chat]] = await db.promise().query(
      "SELECT id FROM chat_conversations WHERE id = ? AND user_id = ?",
      [conversationId, userId]
    );

    if (!chat) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const [result] = await db.promise().query(
      `INSERT INTO chat_messages
       (conversation_id, sender_id, sender_role, body)
       VALUES (?, ?, 'user', ?)`,
      [conversationId, userId, body.trim()]
    );

    await db.promise().query(
      "UPDATE chat_conversations SET updated_at = NOW() WHERE id = ?",
      [conversationId]
    );

    res.status(201).json({
      id: result.insertId,
      conversation_id: conversationId,
      sender_id: userId,
      sender_role: "user",
      body: body.trim(),
      sent_at: new Date().toISOString()
    });

  } catch (err) {
    console.error("[CHAT] send message error:", err.message);
    res.status(500).json({ error: "Failed to send message" });
  }
});









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
        "Spacing medications by 1–4 hours is usually enough because the issue is often absorption-based."
    };
  }

  if (rank === 2) {
    return {
      canSchedule: true,
      gapHours: 4,
      message:
        "Spacing medications by 2–4 hours may help when the issue is absorption or binding-related."
    };
  }

  if (rank === 3) {
    return {
      canSchedule: false,
      gapHours: null,
      message:
        "No fixed time interval can reliably make this combination safe. Timing alone does not resolve this interaction."
    };
  }

  if (rank === 4) {
    return {
      canSchedule: false,
      gapHours: null,
      message:
        "No safe interval exists. This medication combination should be avoided entirely."
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
app.post("/check", requireAuth,async (req, res) => {
  const { drugs } = req.body;
  const userId = req.user.id;

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
                (user_id, drug1, drug2, severity, description, management, clinical_significance)
                VALUES (?, ?, ?, ?, ?, ?, ?)
              `;

              db.query(sql, [
                userId,
                drugA.normalized,
                drugB.normalized,
                interaction.severity,
                interaction.description,
                interaction.management,
                interaction.clinical_significance
              ]);
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

  socket.on("join-admin", () => {
    socket.join("admins");
  });

  socket.on("join-chat", (chatId) => {
    if (!chatId) {
      console.log("chatId is required");
      return;
    }

    socket.join(String(chatId));
    console.log(`Socket ${socket.id} joined chat ${chatId}`);
  });

  socket.on("send-message", (data) => {
    if (!data) {
      console.log("message data is required");
      return;
    }

    if (!data.chatId) {
      console.log("chatId is required");
      return;
    }

    if (!data.body || data.body.trim() === "") {
      console.log("message body is required");
      return;
    }

    if (!data.senderRole) {
      console.log("senderRole is required");
      return;
    }

    io.to(String(data.chatId)).emit("receive-message", data);
    io.to("admins").emit("conversation-updated");
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});