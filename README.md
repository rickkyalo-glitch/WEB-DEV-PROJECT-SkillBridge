SkillBridge

A peer-to-peer skill exchange platform — trade what you know for what you need. No tutoring fees, no job-search pressure, just a fair exchange between people.

Built as a frontend-only web app for a university web development project.

Why SkillBridge?

LinkedIn is built for CVs and professional networking. It has no shared currency, no way to verify an exchange happened, and no incentive system for two-way teaching. SkillBridge is a marketplace instead — built around a Skill Coins economy and a mutual review system, solving a peer-learning problem rather than a job-search one.

Features


Discover — browse users, filter by category or skill, search live, and see a bidirectional compatibility score for each match
Profile — manage the skills you can teach and the skills you want to learn
Requests — send and receive skill-swap requests, or spend Skill Coins when you have nothing to trade yet
Schedule — book learning sessions on an interactive calendar and leave a star rating afterward
Skill Coins — earn coins by teaching, accepting requests, and leaving reviews; spend them to request help


Tech Stack


HTML, CSS, and vanilla JavaScript — no framework, no build step
Tailwind CSS via CDN for styling
Google Fonts: Space Grotesk (headings) and Inter (body text)
All data lives in JavaScript arrays — no backend, no database, no login


Project Structure

skillbridge/
├── index.html      # Page skeleton — nav, page containers, modals
├── style.css       # Animations and states Tailwind can't handle alone
├── data.js         # All seed data: users, requests, sessions, constants
├── utils.js        # Shared state, helper functions, navigation, boot
├── discover.js     # Search, filters, user cards, match algorithm
├── profile.js      # Profile card, skill management
├── requests.js     # Incoming/sent/accepted request tabs
└── schedule.js     # Calendar, session booking, star reviews

Files are split by feature — one file per page — so multiple people can work on the project without merge conflicts. Scripts must load in this order (already set up in index.html):

data.js → utils.js → discover.js → profile.js → requests.js → schedule.js

Each file depends on what loaded before it.

Running Locally

No build step, no installs. Just open it.


Clone the repo
Open index.html in any browser
— or, for live-reload while editing, use the Live Server extension in VS Code


The Matching Algorithm

Every user card shows a compatibility percentage. It checks both directions:

jstheyTeachMe = skills they offer that I want to learn
iTeachThem  = skills they want that I can teach

score = (theyTeachMe + iTeachThem) / totalSkills × 120, capped at 97%

The score is capped below 100% on purpose — a guaranteed perfect match would feel unrealistic.

Skill Coins

ActionEffectAdd a new teachable skill+1 coinAccept an incoming request+2 coinsSubmit a session review+1 coinSend a Skill Coins request−3 coins

License

Student project — built for educational purposes.
