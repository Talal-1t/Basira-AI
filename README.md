# Basira AI

منصة SaaS ثنائية اللغة (عربي/إنجليزي) لرفع ملفات Excel/CSV/PDF وتحليلها والمحادثة معها بالذكاء الاصطناعي.

An AI-powered platform to upload Excel/CSV/PDF files, analyze them, visualize the data, and chat with them.

## البنية / Structure

```
Basira-AI/
  frontend/   React 19 + Vite + Tailwind CSS v4              (تفاصيل: frontend/README.md)
  backend/    Flask + pandas + pdfplumber + Groq (Llama 3.3)  (تفاصيل: backend/README.md)
```

لا يوجد تسجيل دخول بالمشروع — أي شخص يقدر يرفع ملف ويشوف الداشبورد ويكلّم بصيرة مباشرة.
No login required — anyone can upload a file, see the dashboard, and chat with Basira directly.

## تشغيل المشروع كامل / Running everything

يحتاج المشروع تشغيل **خادمين بالتوازي** — الباك إند (Flask) والفرونت إند (React).
You need **two terminals running at the same time** — the backend (Flask) and the frontend (React).

### 1) الباك إند / Backend — Terminal 1

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
```

افتح `backend/.env` وحط مفتاح Groq (اختياري بالبداية — الموقع يشتغل بدونه، بس "AI insights" و"المحادثة" ما تشتغل إلا لو حطيته):
Open `backend/.env` and add your Groq key (optional at first — everything except AI insights/chat works without it):

```
GROQ_API_KEY=your-key-here
```

احصل على مفتاح مجاني من / Get a free key from: https://console.groq.com/keys

```bash
python app.py
```

لازم تشوف / You should see:
```
* Running on http://127.0.0.1:5000
```

### 2) الفرونت إند / Frontend — Terminal 2 (نافذة جديدة / new window)

```bash
cd frontend
npm install
npm run dev
```

لازم تشوف / You should see:
```
Local:   http://localhost:5173/
```

### 3) افتح المتصفح / Open your browser

http://localhost:5173

## تجربة كاملة / A full test run

1. من الصفحة الرئيسية، ارفع ملف Excel/CSV/PDF من قسم الرفع
2. بينقلك تلقائيًا لصفحة الداشبورد `/dashboard/:id` — بتشوف الإحصائيات والرسوم البيانية فورًا
3. لو حطيت مفتاح Groq، بتشوف "AI insights" بنفس الصفحة
4. اضغط "اسأل عن هذا الملف" عشان تروح لصفحة المحادثة `/chat/:id` وكلّم بصيرة عن ملفك

---

1. From the homepage, upload an Excel/CSV/PDF file in the upload section
2. You'll be redirected to `/dashboard/:id` automatically — stats and charts appear immediately
3. If you set a Groq key, AI insights appear on the same page
4. Click "Ask questions about this file" to go to `/chat/:id` and talk to Basira about your file

## ملاحظات مهمة / Important notes

- **ما فيه تسجيل دخول** — الموقع مفتوح للجميع، أبسط وأسرع للتجربة.
- **Groq اختياري** — بدونه، الرفع والداشبورد والرسوم البيانية تشتغل عادي، بس "AI insights" والمحادثة بترجع رسالة واضحة إنها محتاجة مفتاح.
- **حجم الرفع**: حتى 500 ميجابايت لكل ملف (قابل للتعديل بـ `backend/.env`).
- **دعم العربي**: ملفات CSV بترميز عربي (cp1256 من إكسل الويندوز) تُقرأ صح تلقائيًا. نصوص PDF العربية تمر بمعالجة لتصحيح اتجاه القراءة (best-effort — راجع `backend/README.md`).

---

- **No login** — the site is open to everyone, simpler and faster to try.
- **Groq is optional** — upload, dashboard, and charts work fine without it; AI insights/chat return a clear "not configured" message instead of crashing.
- **Upload size**: up to 500MB per file (configurable in `backend/.env`).
- **Arabic support**: CSVs in Arabic encodings (cp1256, common from Excel on Windows) are auto-detected and read correctly. Arabic PDF text goes through a best-effort RTL correction pass — see `backend/README.md`.

## النشر لاحقًا / Deploying later

- Frontend → Vercel (`frontend/README.md` has the build command)
- Backend → Render (`backend/README.md` has the build/start commands)

هذا الجزء لسا ما تم — المشروع شغّال محليًا بالكامل، والنشر خطوة قادمة.
Not done yet — the project runs fully locally; deployment is a future step.
