import express from "express";

const router = express.Router();

router.post("/", (req, res) => {
  const { question } = req.body;
  let answer =
    "Welcome to the Science & Tech Club portal. Use the left navigation to access your dashboard.";

  if (question?.toLowerCase().includes("project")) {
    answer =
      "Projects are under the 'Projects' section in your dashboard. Create a new project or join existing ones with vacancies.";
  } else if (question?.toLowerCase().includes("quiz")) {
    answer =
      "Quizzes are generated from your syllabus. Check the 'Quizzes' section and ask faculty or admin if you do not see any.";
  } else if (question?.toLowerCase().includes("chat")) {
    answer =
      "You can chat with your project team in project chats, message committee, representatives, and chair as configured.";
  }

  res.json({ answer });
});

export default router;
