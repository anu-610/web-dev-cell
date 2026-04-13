# Web Dev Cell Official Website

I'm Anuraj KTK (Team TensorV3).

I designed this project focusing on basic production features and security. It uses a modern tech stack with a React/Vite front-end, a Python/FastAPI back-end, and a PostgreSQL database. It also uses Cloudflare, Google OAuth, and reCAPTCHA to prevent bot attacks.

Live link: https://webdevcell.tech

---

## Local Setup

To run this project locally, configure the environment variables and run the Docker containers:

1. Configure Environment Variables:
   - Copy the .env.example file in the root directory and rename it to .env. Fill in the database and Supabase credentials.
   - Go into the frontend folder, copy frontend/.env.example, rename it to frontend/.env, and add your VITE API keys.

2. Launch with Docker:
   Run the following command from the root directory to build and start the application:
   ```
   docker compose up --build
   ```

---

## Core Features

I built a public website and an administrative backend. Here are the main features:

* Interactive UI: A CSS 3D Mac terminal hero section with a custom cursor and hover effects.
* Community Blog: A blog system where students can write posts, manage them via a "My Posts" tab, and edit them.
* Admin Panel: A hidden admin dashboard protected by Google reCAPTCHA.
* Moderation System: Student posts go into a pending queue where admins can approve, edit, or reject them with a reason.
* Theme Management: Admins can change the website's theme globally from the dashboard.
* Notifications: A notification system for announcements and updates.
* GitHub Integration: Shows live GitHub stats and dynamically loaded project thumbnails and avatars.
* Security: Blog posting is restricted to verified students. It only accepts @students.iitmandi.ac.in emails via Supabase.

---

## Top 3 Technical Challenges

1. Datetime Timezone Bug
   The Problem: The admin scheduler used a datetime-local input. When the time was changed, the input cursor jumped and the time shifted by 5.5 hours due to timezone differences between the frontend and the database.
   The Fix: I updated the component to format ISO strings strictly to local time before sending them to the backend. This fixed the input jump and saved the correct time.

2. CSS 3D Terminal Design
   The Problem: I initially tried Three.js for a 3D effect but it was too heavy. I built a Mac Terminal using pure CSS 3D transforms instead. But making the perspective look natural without overlapping text on smaller screens was difficult.
   The Fix: I adjusted the perspective and rotations, and used flex layouts to prevent the terminal from overlapping the text on tablet screens.

3. Docker and Nginx Upload Issues
   The Problem: In production, Nginx blocked requests for uploaded images. Also, every time the Docker container restarted, all uploaded images were deleted.
   The Fix: I updated the nginx configuration to correctly route image requests to the backend. I also added a Docker volume so the database and uploaded images are saved permanently.

---

## Tech Stack
* Frontend: React, TypeScript, Vite, Tailwind CSS, Zustand, React Router, Quill
* Backend: Python, FastAPI, SQLAlchemy, Alembic
* Database & Auth: PostgreSQL, Supabase Auth
* Infrastructure: Docker, Docker Compose, Nginx

Built by Anuraj KTK (Team TensorV3).
