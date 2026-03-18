# 🐉 DragonByte — Community Website

> Learn. Hack. Defend. Grow.

A full cybersecurity & CTF community website built with **Next.js 14 + Firebase**.

---

## 📁 Project Structure

```
dragonbyte/
├── app/
│   ├── page.js              ← Home page
│   ├── layout.js            ← Root layout (Navbar + Footer)
│   ├── globals.css          ← Global styles + cyber theme
│   ├── about/page.js        ← About page
│   ├── members/page.js      ← Members page (search + filter)
│   ├── events/page.js       ← Events page (upcoming + past)
│   ├── team-finder/page.js  ← Team finder page
│   ├── join/page.js         ← Join community form
│   └── admin/page.js        ← Admin dashboard (protected)
├── components/
│   ├── Navbar.js            ← Navigation bar
│   ├── Footer.js            ← Footer
│   └── MatrixBg.js          ← Animated matrix rain
├── lib/
│   └── firebase.js          ← Firebase config
├── public/
│   └── dragon_byte_new.png  ← YOUR LOGO (copy here!)
├── .env.local.example       ← Firebase env template
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## 🚀 STEP-BY-STEP SETUP IN VS CODE

### ✅ STEP 1 — Install Requirements

Make sure you have these installed on your computer:

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org
   - Choose "LTS" version
   - After install, open terminal and check:
     ```
     node --version
     npm --version
     ```

2. **VS Code**
   - Download from: https://code.visualstudio.com

3. **VS Code Extensions** (recommended):
   - ES7+ React/Redux/React-Native snippets
   - Tailwind CSS IntelliSense
   - Prettier - Code formatter

---

### ✅ STEP 2 — Get the Project Files

You already have all the code files. Now organize them like this:

1. Create a new folder on your Desktop called `dragonbyte`
2. Copy all the files from the code into this folder
3. Make sure the folder structure matches exactly what is shown above

---

### ✅ STEP 3 — Open in VS Code

1. Open VS Code
2. Click **File → Open Folder**
3. Select your `dragonbyte` folder
4. You should see all files in the left sidebar

---

### ✅ STEP 4 — Open Terminal in VS Code

1. Press `Ctrl + `` ` (backtick key, top-left of keyboard)
   OR go to **Terminal → New Terminal**
2. You should see a terminal at the bottom of VS Code

---

### ✅ STEP 5 — Install Dependencies

In the VS Code terminal, type this and press Enter:

```bash
npm install
```

Wait for it to finish (may take 1–2 minutes). You'll see a `node_modules` folder appear.

---

### ✅ STEP 6 — Add Your Logo

1. Find your logo file: `dragon_byte_new.png`
2. Copy it into the `public/` folder of your project
3. It should be at: `dragonbyte/public/dragon_byte_new.png`

---

### ✅ STEP 7 — Setup Firebase (for real data)

**A. Create Firebase Project:**
1. Go to https://console.firebase.google.com
2. Click **"Add project"**
3. Name it: `dragonbyte`
4. Click through the setup steps

**B. Enable Authentication:**
1. In Firebase Console → **Authentication**
2. Click **"Get started"**
3. Click **"Email/Password"** → Enable it → Save

**C. Create Firestore Database:**
1. In Firebase Console → **Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
4. Select your region → Done

**D. Get Your Firebase Config:**
1. In Firebase Console → Click the **gear icon** (Project Settings)
2. Scroll down to **"Your apps"**
3. Click **"</> Web"** to add a web app
4. Name it `dragonbyte-web` → Register
5. Copy the config values shown

**E. Create .env.local file:**
1. In VS Code, create a new file called `.env.local` in your project root
2. Fill it like this (replace with YOUR values):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dragonbyte.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dragonbyte
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dragonbyte.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:xxxxx
```

---

### ✅ STEP 8 — Run the Website Locally

In the VS Code terminal:

```bash
npm run dev
```

You'll see:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Ready in X.Xs
```

Open your browser and go to: **http://localhost:3000** 🎉

---

### ✅ STEP 9 — Test All Pages

| Page          | URL                              |
|---------------|----------------------------------|
| Home          | http://localhost:3000            |
| About         | http://localhost:3000/about      |
| Members       | http://localhost:3000/members    |
| Events        | http://localhost:3000/events     |
| Team Finder   | http://localhost:3000/team-finder|
| Join          | http://localhost:3000/join       |
| Admin         | http://localhost:3000/admin      |

**Admin Login:**
- Email: `admin@dragonbyte.com`
- Password: `admin123`

---

### ✅ STEP 10 — Deploy to Vercel (Make it Live!)

1. Go to https://vercel.com and sign up (free)
2. Click **"New Project"**
3. Import your project from GitHub
   - First push to GitHub: https://github.com/new
4. In Vercel, add your environment variables:
   - Go to **Settings → Environment Variables**
   - Add all 6 Firebase variables from your `.env.local`
5. Click **Deploy** — your site will be live in 2 minutes!

---

## 🔥 Connect Firebase to Real Data

Right now the website uses sample data. To connect real Firebase data:

### Events (example):
```js
// In app/events/page.js, replace sample data with:
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

const snapshot = await getDocs(collection(db, 'events'))
const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
```

### Join Requests (example):
```js
// In app/join/page.js, replace handleSubmit with:
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

await addDoc(collection(db, 'join_requests'), {
  ...form, skills,
  status: 'pending',
  createdAt: serverTimestamp()
})
```

---

## 🛠️ Common Problems & Fixes

| Problem | Fix |
|---------|-----|
| `npm install` fails | Make sure Node.js is installed correctly |
| Page not loading | Check terminal for errors, restart with `npm run dev` |
| Logo not showing | Make sure `dragon_byte_new.png` is in the `public/` folder |
| Firebase errors | Check `.env.local` values match your Firebase console |
| Port 3000 busy | Run `npm run dev -- --port 3001` |

---

## 🎨 Customization

- **Change colors** → Edit `app/globals.css` CSS variables
- **Add members** → Edit the `MEMBERS` array in `app/members/page.js`
- **Add events** → Use Admin Dashboard at `/admin`
- **Change founder info** → Edit `app/about/page.js`
- **Update stats** → Edit the counter targets in `app/page.js`

---

## 📞 Admin Credentials (Change in Production!)

```
Email:    admin@dragonbyte.com
Password: admin123
```

> ⚠️ Before going live, connect Firebase Auth and change these credentials!

---

*Built for DragonByte Community — Learn. Hack. Defend. Grow. 🐉*
