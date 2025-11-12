🧠 Overview

EduInsight transforms traditional student feedback into actionable analytics.
Built with React, Node.js, Express, and PostgreSQL, it integrates feedback collection, data storage, and real-time visualization in one unified system.

👩‍🎓 Student Role

Students can:

View approved courses (validated by Admins).

Submit feedback forms for both instructors and courses.

Ratings and optional comments are stored in PostgreSQL, forming the dataset for institutional analytics.

💡 Each student submission feeds directly into the admin dashboard, where aggregate trends are calculated automatically.

👨‍🏫 Instructor Role

Instructors can:

Upload new courses with details such as title, code, and semester.

Submitted courses remain pending until reviewed and approved by Admin.

Once approved, courses appear in the Student dashboard for feedback collection.

Instructors cannot access analytics — ensuring academic privacy and data integrity.

📌 This mirrors real-world university workflows where instructors contribute teaching data, while admins oversee analysis.

🧑‍💼 Admin Role

Admins have full visibility and control over the platform.
They can:

Approve or reject instructor-submitted courses.

Monitor student feedback submissions.

Access a data analytics dashboard with:

📊 Average ratings (course / instructor / semester)

🔍 Comparative satisfaction insights

📈 Predictive trend forecasting using linear regression

🧾 PDF export of analytics reports

💼 This centralizes academic quality assurance and evidence-based decision-making.

🔄 Feedback Lifecycle
Step	Action	Handled By
1️⃣	Instructor uploads a course	Instructor
2️⃣	Admin reviews and approves	Admin
3️⃣	Course appears for student feedback	Student
4️⃣	Student submits responses	Student
5️⃣	Admin analyzes results	Admin

This closed-loop system ensures accountability and transparency across all academic roles.

⚙️ Tech Stack
Layer	Technology
Frontend	React (Vite) + Material UI + Recharts
Backend	Node.js + Express
Database	PostgreSQL
Authentication	JWT (JSON Web Tokens)
Visualization	Recharts (BarChart, ComposedChart, Line)
Report Export	jsPDF + html2canvas
Hosting / Dev Tools	GitHub, Codespaces, Firebase (optional)
📈 Analytics Features

Course & Instructor Comparison — parallel bars show rating alignment.

Semester Trend Tracking — visualize satisfaction progression over time.

Predictive Forecasting — forecast next semester satisfaction via linear regression.

AI-Style Insight Summary — automatically narrates data findings in natural language.

Export to PDF — generate complete reports for institutional use.

🧩 Example Insight

“Overall student satisfaction improved by 3.2% since last semester.
Instructors and courses remain closely aligned, indicating consistent teaching quality.”

🧠 Key Learning Outcomes

Through EduInsight, I strengthened my experience in:

Designing relational schemas for multi-role systems.

Developing secure JWT-based authentication.

Building data visualization dashboards with React and Recharts.

Implementing predictive analytics logic in JavaScript.

Managing end-to-end full-stack development workflows.
