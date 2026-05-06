

const express      = require("express");
const db           = require("../db");
const { requireAuth }  = require("../middleware/auth");
const { requireAdmin } = require("../middleware/requireAdmin");

const router = express.Router();


router.use(requireAuth, requireAdmin);


// ============================================================
//  STATS  —  GET /admin/stats
//
//  Returns aggregate counts for the dashboard overview cards.
//  Runs 6 queries in parallel via Promise.all for speed.
// ============================================================

router.get("/stats", async (req, res) => {
  try {
    const [
      [usersRow],
      [checksRow],
      [pendingRow],
      [messagesRow],
      recentUsers,
      recentPending,
      [unreadRow],
    ] = await Promise.all([

      // Total registered users
      db.promise().query("SELECT COUNT(*) AS total FROM users"),

      // Total interaction checks ever run
      db.promise().query("SELECT COUNT(*) AS total FROM interaction_checks"),

      // Unresolved drug normalization tasks
      db.promise().query(
        "SELECT COUNT(*) AS total FROM unresolved_drugs WHERE status = 'pending'"
      ),

      // Total chat messages sent across all conversations
      db.promise().query("SELECT COUNT(*) AS total FROM chat_messages"),

      // 5 most recently registered users (for the overview mini-list)
      db.promise().query(
        "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 5"
      ),

      // 5 most recent pending drug tasks (for the overview mini-list)
      db.promise().query(
        "SELECT id, drug_name, attempted_at FROM unresolved_drugs WHERE status = 'pending' ORDER BY attempted_at DESC LIMIT 5"
      ),

      // Count of unread messages sent by users (not yet read by admin side)
      db.promise().query(
        "SELECT COUNT(*) AS total FROM chat_messages WHERE sender_role = 'user' AND is_read = 0"
      ),
    ]);

    return res.json({
      totalUsers:     usersRow[0].total,
      totalChecks:    checksRow[0].total,
      pendingDrugs:   pendingRow[0].total,
      totalMessages:  messagesRow[0].total,
      unreadMessages: unreadRow[0].total,
      recentUsers:    recentUsers[0],
      recentPending:  recentPending[0],
    });

  } catch (err) {
    console.error("[Admin] /stats error:", err.message);
    return res.status(500).json({ error: "Failed to load stats" });
  }
});


// ============================================================
//  USERS  —  GET /admin/users
//
//  Returns all users ordered by newest first.
//  Excludes password_hash for safety.
// ============================================================

router.get("/users", async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC"
    );
    return res.json(rows);

  } catch (err) {
    console.error("[Admin] /users error:", err.message);
    return res.status(500).json({ error: "Failed to load users" });
  }
});


// ============================================================
//  MAPPINGS — pending
//  GET /admin/mappings/pending
//
//  Returns all unresolved_drugs rows with status = 'pending'.
//  These are drugs that failed normalization and need an admin
//  to manually map them to a correct generic name.
// ============================================================

router.get("/mappings/pending", async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT id, drug_name, attempted_at
       FROM unresolved_drugs
       WHERE status = 'pending'
       ORDER BY attempted_at DESC`
    );
    return res.json(rows);

  } catch (err) {
    console.error("[Admin] /mappings/pending error:", err.message);
    return res.status(500).json({ error: "Failed to load pending drugs" });
  }
});


// ============================================================
//  MAPPINGS — resolved
//  GET /admin/mappings/resolved
//
//  Returns all completed drug_mappings, joined with the admin
//  user's name who resolved each one.
// ============================================================

router.get("/mappings/resolved", async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT
         dm.id,
         dm.original,
         dm.mapped,
         dm.created_at,
         u.name AS resolved_by_name
       FROM drug_mappings dm
       LEFT JOIN users u ON u.id = dm.created_by
       ORDER BY dm.created_at DESC`
    );
    return res.json(rows);

  } catch (err) {
    console.error("[Admin] /mappings/resolved error:", err.message);
    return res.status(500).json({ error: "Failed to load resolved mappings" });
  }
});


// ============================================================
//  RESOLVE MAPPING  —  POST /admin/mappings/:id/resolve
//
//  Receives:  { mapped: "Acetylsalicylic acid" }
//  :id        = unresolved_drugs.id
//
//  What it does:
//    1. Validates the mapped name is non-empty
//    2. Inserts into drug_mappings (original → mapped)
//    3. Updates unresolved_drugs row to status = 'resolved'
//    4. Returns the new mapping record
//
//  Uses a transaction so both writes succeed or neither does.
// ============================================================

router.post("/mappings/:id/resolve", async (req, res) => {
  const unresolvedId = parseInt(req.params.id, 10);
  const { mapped }   = req.body;
  const adminId      = req.user.id;

  if (!mapped || !mapped.trim()) {
    return res.status(400).json({ error: "mapped name is required" });
  }

  if (isNaN(unresolvedId)) {
    return res.status(400).json({ error: "Invalid task ID" });
  }

  const conn = await db.promise().getConnection();

  try {
    await conn.beginTransaction();

    // Fetch the pending drug row so we know the original name
    const [[pending]] = await conn.query(
      "SELECT id, drug_name, status FROM unresolved_drugs WHERE id = ?",
      [unresolvedId]
    );

    if (!pending) {
      await conn.rollback();
      return res.status(404).json({ error: "Task not found" });
    }

    if (pending.status === "resolved") {
      await conn.rollback();
      return res.status(409).json({ error: "This task is already resolved" });
    }

    // Insert into drug_mappings
    // ON DUPLICATE KEY UPDATE handles the case where the same original
    // drug was flagged multiple times — we just update the mapping.
    const [mappingResult] = await conn.query(
      `INSERT INTO drug_mappings (original, mapped, created_by)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
         mapped      = VALUES(mapped),
         created_by  = VALUES(created_by)`,
      [pending.drug_name.trim(), mapped.trim(), adminId]
    );

    const mappingId = mappingResult.insertId || null;

    // Mark the unresolved_drugs row as resolved
    await conn.query(
      `UPDATE unresolved_drugs
       SET status      = 'resolved',
           resolved_by = ?,
           resolved_at = NOW(),
           mapping_id  = ?
       WHERE id = ?`,
      [adminId, mappingId, unresolvedId]
    );

    await conn.commit();

    return res.json({
      success:  true,
      original: pending.drug_name,
      mapped:   mapped.trim(),
    });

  } catch (err) {
    await conn.rollback();
    console.error("[Admin] /mappings/resolve error:", err.message);
    return res.status(500).json({ error: "Failed to save mapping" });

  } finally {
    conn.release();
  }
});


// ============================================================
//  CHAT — list all conversations
//  GET /admin/chat/conversations
//
//  Returns every conversation row joined with:
//    - the user's name
//    - the last message body + timestamp
//    - count of unread messages from the user
// ============================================================

router.get("/chat/conversations", async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT
         cc.id,
         cc.user_id,
         u.name        AS user_name,
         cc.updated_at,
         (
           SELECT body FROM chat_messages
           WHERE conversation_id = cc.id
           ORDER BY sent_at DESC LIMIT 1
         ) AS last_message,
         (
           SELECT COUNT(*) FROM chat_messages
           WHERE conversation_id = cc.id
             AND sender_role = 'user'
             AND is_read = 0
         ) AS unread_count
       FROM chat_conversations cc
       JOIN users u ON u.id = cc.user_id
       ORDER BY cc.updated_at DESC`
    );
    return res.json(rows);

  } catch (err) {
    console.error("[Admin] /chat/conversations error:", err.message);
    return res.status(500).json({ error: "Failed to load conversations" });
  }
});


// ============================================================
//  CHAT — start or fetch conversation with a specific user
//  POST /admin/chat/conversations/start
//
//  Body: { userId: 42 }
//
//  If a conversation already exists for this user, returns it.
//  If not, creates a new one.
//  This lets admins initiate a chat from the Users table.
// ============================================================

router.post("/chat/conversations/start", async (req, res) => {
  const { userId } = req.body;

  if (!userId || isNaN(parseInt(userId))) {
    return res.status(400).json({ error: "userId is required" });
  }

  try {
    // Check if a conversation already exists for this user
    const [[existing]] = await db.promise().query(
      "SELECT id FROM chat_conversations WHERE user_id = ? LIMIT 1",
      [userId]
    );

    if (existing) {
      return res.json({ conversationId: existing.id, created: false });
    }

    // Create a new conversation
    const [result] = await db.promise().query(
      "INSERT INTO chat_conversations (user_id) VALUES (?)",
      [userId]
    );

    return res.status(201).json({ conversationId: result.insertId, created: true });

  } catch (err) {
    console.error("[Admin] /chat/conversations/start error:", err.message);
    return res.status(500).json({ error: "Failed to start conversation" });
  }
});


// ============================================================
//  CHAT — get messages in a conversation
//  GET /admin/chat/conversations/:id/messages
//
//  Returns all messages in chronological order, joined with
//  the sender's name. Also marks all user messages as read.
// ============================================================

router.get("/chat/conversations/:id/messages", async (req, res) => {
  const convId = parseInt(req.params.id, 10);

  if (isNaN(convId)) {
    return res.status(400).json({ error: "Invalid conversation ID" });
  }

  try {
    // Mark user messages in this conversation as read
    await db.promise().query(
      `UPDATE chat_messages
       SET is_read = 1
       WHERE conversation_id = ? AND sender_role = 'user'`,
      [convId]
    );

    // Fetch messages with sender name
    const [rows] = await db.promise().query(
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

    return res.json(rows);

  } catch (err) {
    console.error("[Admin] /chat/messages GET error:", err.message);
    return res.status(500).json({ error: "Failed to load messages" });
  }
});


// ============================================================
//  CHAT — send a message as admin
//  POST /admin/chat/conversations/:id/messages
//
//  Body: { body: "Hello, how can I help?" }
//
//  Inserts a new chat_messages row with sender_role = 'admin'.
//  Also bumps chat_conversations.updated_at so the conversation
//  rises to the top of the list on both admin and user sides.
// ============================================================

router.post("/chat/conversations/:id/messages", async (req, res) => {
  const convId  = parseInt(req.params.id, 10);
  const adminId = req.user.id;
  const { body } = req.body;

  if (isNaN(convId)) {
    return res.status(400).json({ error: "Invalid conversation ID" });
  }

  if (!body || !body.trim()) {
    return res.status(400).json({ error: "Message body is required" });
  }

  try {
    // Verify the conversation exists
    const [[conv]] = await db.promise().query(
      "SELECT id FROM chat_conversations WHERE id = ?",
      [convId]
    );

    if (!conv) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Insert message
    const [result] = await db.promise().query(
      `INSERT INTO chat_messages (conversation_id, sender_id, sender_role, body)
       VALUES (?, ?, 'admin', ?)`,
      [convId, adminId, body.trim()]
    );

    // Bump conversation updated_at so it sorts to the top
    await db.promise().query(
      "UPDATE chat_conversations SET updated_at = NOW() WHERE id = ?",
      [convId]
    );

    return res.status(201).json({
      success: true,
      messageId: result.insertId,
    });

  } catch (err) {
    console.error("[Admin] /chat/messages POST error:", err.message);
    return res.status(500).json({ error: "Failed to send message" });
  }
});


module.exports = router;