const express     = require("express");
const db          = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);




router.get("/history", async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT
         ic.id,
         ic.drug1,
         ic.drug2,
         ic.severity,
         ic.created_at,
         CASE WHEN s.id IS NOT NULL THEN 1 ELSE 0 END AS has_schedule
       FROM interaction_checks ic
       LEFT JOIN schedules s ON s.interaction_check_id = ic.id
       WHERE ic.user_id = ?
       ORDER BY ic.created_at DESC`,
      [req.user.id]
    );

    return res.json(rows);

  } catch (err) {
    console.error("[User] /history error:", err.message);
    return res.status(500).json({ error: "Failed to load history" });
  }
});











router.get("/history/:id/schedule", async (req, res) => {
  const checkId = parseInt(req.params.id, 10);

  if (isNaN(checkId)) {
    return res.status(400).json({ error: "Invalid check ID" });
  }

  try {
    const [[row]] = await db.promise().query(
      `SELECT s.schedule_json
       FROM schedules s
       JOIN interaction_checks ic ON ic.id = s.interaction_check_id
       WHERE s.interaction_check_id = ?
         AND ic.user_id = ?`,
      [checkId, req.user.id]
    );

    if (!row) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    const parsed = typeof row.schedule_json === "string"
      ? JSON.parse(row.schedule_json)
      : row.schedule_json;

    return res.json(parsed);

  } catch (err) {
    console.error("[User] /history/:id/schedule error:", err.message);
    return res.status(500).json({ error: "Failed to load schedule" });
  }
});


module.exports = router;