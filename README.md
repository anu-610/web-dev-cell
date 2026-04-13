# Web Dev Cell — Official Website

I'm **Anuraj KTK** (Team **TensorV3**)

I designed this project basically focusing on production grade features and security.
It features a complete modern tech stack, bridging a React/Vite front-end with a fast Python/FastAPI back-end and PostgreSQL database.
Used cloudflare, google OAuth, reCaptcha for preventing attacks from bots

live link: https://webdevcell.tech

---

## Core Features

I focused heavily on creating both a good public-facing UI and a robust administrative backend. Here are the main features built into this application:

* **Interactive Hacker Aesthetic:** A fully responsive, pure-CSS interactive 3D Mac terminal hero section, integrated with a custom magnetic cursor and "glasscard" spotlight hover effects.
* **Community Engineering Blog:** A complete blog system with a rich-text Quill editor. Students can authenticate securely, write posts, manage them via a "My Posts" tab, and edit them seamlessly.
* **Secure Admin CMS:** A dedicated, hidden `/admin` dashboard protected by invisible Google reCAPTCHA v3.
* **Robust Moderation Pipeline:** Student posts go into a "Pending" queue where admins can approve, edit, or reject them. (If rejected, admins can attach a specific rejection reason for the author to review).
* **Global Theme Management:** Admins can change the entire website's visual theme (like switching from Dark Hacker to a vibrant preset) globally with one click from the dashboard. This syncs via the FastAPI backend to instantly update everyone's UI.
* **Live Community Notifications:** A beautiful notification and announcements system so users never miss a hackathon or club update.
* **GitHub & Member Integration:** Live pulls of GitHub stats alongside dynamically uploaded project thumbnails and team avatars.
* **Strict OAuth Security:** Blog posting is exclusively restricted to verified students. The system strictly blocks arbitrary Gmail accounts and only accepts `@students.iitmandi.ac.in` email addresses via Supabase OAuth.

---

## Top 3 Technical Challenges I Faced



1. **The Infamous Datetime-Local Timezone Bug**
   * *The Problem:* Building the admin scheduler required using HTML5 `<input type="datetime-local">`. However, every time an admin changed the time, the input cursor would violently jump, and React state was silently shifting the times by 5.5 hours due to local vs. UTC timezone collisions between the frontend state and the PostgreSQL database.
   * *The Fix:* I rewrote (as u know gemini) the controlled component handlers to explicitly format ISO strings strictly into local boundaries before syncing to the backend, completely stabilizing the cursor and ensuring accurate time records.

2. **Pure-CSS 3D (The Terminal)**
   * *The Problem:* I originally tried using Three.js for a 3D effect, but it was too heavy. I pivoted to building a Mac Terminal out of pure CSS 3D transforms. However, keeping the perspective looking natural (projecting outward rather than caving inward) while ensuring it didn't overlap the text on tablet screens required intense breakpoint math. 
   * *The Fix:* I completely overhauled the `perspective-origin` and Z-axis rotations, and implemented rigid flex stacking for `md` breakpoints to prevent the terminal from crashing into the hero text on smaller devices.

3. **Docker Nginx Proxying & Ephemeral Uploads**
   * *The Problem:* In production, Nginx was completely hijacking requests for `/uploads/image.png` because its static-file regex thought the image lived in the React build folder instead of proxying it to the Python backend API! Plus, every time I rebuilt the Docker container, all admin-uploaded images were instantly deleted.
   * *The Fix:* I manually forced a `^~` modifier in `nginx.conf` so the `/uploads/` prefix took absolute priority over the static regex, successfully routing images to FastAPI. I then configured a dedicated Docker Named Volume so the database and uploaded images persisted correctly across rebuilds and deployments.

---

## Tech Stack
* **Frontend:** React, TypeScript, Vite, Tailwind CSS, Zustand, React Router, Quill.
* **Backend:** Python, FastAPI, SQLAlchemy, Alembic (Migrations).
* **Database & Auth:** PostgreSQL, Supabase Auth.
* **Infrastructure:** Docker, Docker Compose, Nginx.

---

*Built by Anuraj KTK (Team TensorV3).*
