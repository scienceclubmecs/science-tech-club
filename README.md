# README.md

```markdown
# Science & Tech Club Portal

A **black & white** web portal for science and technology clubs to attract students to projects, research, and events. Features role-based dashboards (student, faculty, admin, committee, executives, representatives, developers), project management, quizzes, chats, and events. [web:36][web:37][web:42]

## 🚀 Features

- **Role-based access**: Student, Faculty, Admin, Committee (Chair/Vice/Secretary), Executives, Representatives, Developers
- **Projects**: Create/join projects, auto group chat, faculty guides
- **Quizzes**: Syllabus-based quizzes (admin/faculty upload)
- **Chats**: Project groups, student↔committee/chair DMs, executive/representative common rooms
- **Events**: Auto task creation (photos/posters/banners/reports), chair approval
- **Bulk upload**: Students (roll‑based password), faculty (employment ID)
- **Responsive**: Works on desktop, mobile (Android/iOS), Windows/macOS
- **Configurable**: Logo, site name, Git repo, faculty coordinator/manager/advisor/incharge
- **Guide chatbot**: Simple AI helper for all users
- **Welcome emails**: Automatic when admin uploads students

## 🛠 Tech Stack

| Frontend | Backend | Database | Deployment |
|----------|---------|----------|------------|
| React 18 + Vite + Tailwind CSS | Node.js + Express | Supabase (Postgres) | Netlify (FE) + Render (BE) |

## 📋 Prerequisites

- [Node.js](https://nodejs.org) (v18+)
- [Supabase](https://supabase.com) account
- SMTP service (Gmail/SendGrid/SMTP2GO)

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/science-tech-club.git
cd science-tech-club
```

**Backend**:
```bash
cd server
npm install
cp .env.example .env
```

**Frontend**:
```bash
cd ../client
npm install
```

### 2. Supabase Setup

1. Create project at [supabase.com](https://supabase.com)
2. Copy **SQL schema** from `/docs/supabase-schema.sql` → Supabase SQL Editor → Run
3. **Settings** → **API** → copy `URL`, `anon public`, `service_role` keys
4. **Settings** → **Auth** → Email → enable (optional, using custom auth)

### 3. Environment Variables

**`server/.env`**:
```txt
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
JWT_SECRET=your-jwt-secret

# SMTP (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your@gmail.com
PORT=5000
```

**`client/.env`**:
```txt
VITE_API_BASE_URL=http://localhost:5000/api
```

**SMTP Options**: [Gmail App Password](https://myaccount.google.com/apppasswords), [SMTP2GO Free](https://smtp2go.com), [SendGrid Free](https://sendgrid.com/free)

### 4. Run Locally

**Backend**:
```bash
cd server
npm run dev
```

**Frontend**:
```bash
cd client
npm run dev
```

Visit `http://localhost:5173`

### 5. Seed Admin User

In Supabase SQL Editor:
```sql
-- Create admin user
insert into public.users (username, role, department, photo_url)
values ('admin', 'admin', 'Admin', '/default.png');

-- Set admin password (username = 'admin')
insert into public.user_passwords (user_id, password_hash)
values (
  (select id from public.users where username = 'admin'),
  '$2a$10$your_bcrypt_hash_of_admin_password'
);
```

Generate hash: `npm install bcrypt-cli -g && bcrypt "admin" 10`

Login: `username: admin`, `password: admin`

---

## 🚀 Production Deployment

### Backend (Render/Railway)

1. Push to GitHub
2. [render.com](https://render.com) → New → Web Service → your repo
3. Root: `server`
4. Build: `npm install`
5. Start: `npm run start`
6. Add `.env` vars in dashboard
7. Note backend URL: `https://your-backend.onrender.com`

### Frontend (Netlify)

1. [netlify.com](https://netlify.com) → New site → GitHub repo
2. Base directory: `client`
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Env var: `VITE_API_BASE_URL=https://your-backend.onrender.com/api`
6. Deploy → `https://your-club.netlify.app`

### Configure Site

1. Admin login → Developers dashboard → set logo URL, site name, Git repo
2. Admin → upload students/faculty CSV → welcome emails sent
3. Admin → set faculty coordinator/manager/advisor/incharge

---

## 📁 Project Structure

```
science-tech-club/
├── server/                 # Node.js + Express + Supabase API
│   ├── src/
│   │   ├── config/supabase.js
│   │   ├── models/         # SQL schema in /docs/supabase-schema.sql
│   │   ├── routes/         # All API endpoints
│   │   └── utils/mail.js   # Welcome emails
│   ├── package.json
│   └── .env
├── client/                 # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/     # Layout, ChatBox, GuideChatbot
│   │   ├── pages/          # All role dashboards
│   │   └── context/AuthContext.jsx
│   ├── package.json
│   └── .env
└── README.md
```

---

## 🧪 CSV Upload Format

**Students** (`students.csv`):
```csv
surname,dob,department,year,email,photo_url
Mathsa,07-06-2005,CSE/AIML/CSD,3,mathsa@example.com,/photo.jpg
```

**Faculty** (`faculty.csv`):
```csv
email,employmentId,department,photo_url
prof@example.com,EMP001,CSE/AIML/CSD,/photo.jpg
```

---

## 🔧 Customization

- **Logo**: Admin/Developers → Config → paste image URL
- **Theme**: Config → primary/background colors
- **Chats**: Add new rooms via `room="new_room_name"` in ChatBox
- **SMTP**: Swap providers in `.env`
- **Supabase**: Add RLS policies for production security

## 📱 Cross-Platform

✅ **Responsive** on Windows/macOS/Linux desktop browsers  
✅ **Mobile-first** on Android/iOS browsers  
✅ **PWA-ready** (add manifest for app‑like install)

---

## 🤝 Contributing

1. Fork repo
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing`)
5. Open Pull Request

## 📄 License

MIT License – see [LICENSE](LICENSE)

## 👥 Support

- [Supabase Docs](https://supabase.com/docs)
- [Netlify Deploy Guide](https://docs.netlify.com)
- Questions: Open GitHub issue

---

**Made for students who love building things. 🚀**
```

Save this as `README.md` in your `science-tech-club/` root folder. It covers everything needed for someone (future club members) to run, deploy, and extend the project. [ijies](https://www.ijies.net/finial-docs/finial-pdf/2204251048.pdf)
