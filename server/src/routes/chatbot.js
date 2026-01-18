import express from "express";

const router = express.Router();

router.post("/", (req, res) => {
  const { question } = req.body;
  let answer = "Welcome to Science & Tech Club portal. Use navigation to access your dashboard.";

  if (question?.toLowerCase().includes("project")) {
    answer = "Projects are in your dashboard. Create new or join ones with vacancies.";
  } else if (question?.toLowerCase().includes("quiz")) {
    answer = "Quizzes are in dashboard. Ask faculty/admin if none visible.";
  } else if (question?.toLowerCase().includes("chat")) {
    answer = "Chat with project teams, committee, representatives via dashboard.";
  } else if (question?.toLowerCase().includes("login")) {
    answer = "Use username/password assigned by admin. Check welcome email.";
  }

  res.json({ answer });
});

export default router;
