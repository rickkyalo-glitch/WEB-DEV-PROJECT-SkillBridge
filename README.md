1.  Project Summary
What is SkillBridge?
SkillBridge is a web app where people trade skills instead of money — teach what you know, learn what you need. Built as a frontend-only single page application: four pages, no backend, no login, all data held in JavaScript arrays.

The platform connects people across very different skill areas — a Technology specialist, a Designer, a Sales lead, a musician, a Chemistry tutor, a Public Speaking coach, a martial arts instructor — and lets them trade lessons directly rather than paying for tutoring or relying on a CV-based network like LinkedIn.

Why not LinkedIn?
LinkedIn is a CV and professional-networking tool. It has no shared currency, no built-in way to verify an exchange happened, and no incentive system. SkillBridge has all three: a bidirectional match score, a Skill Coins economy, and a two-way star review system.

Design direction
Light theme inspired by Notion, Linear, Stripe, and Airbnb — white background, black primary text, a single emerald green accent, soft layered card shadows, large rounded corners. Headings use Space Grotesk, body text uses Inter.
 
2.  Features
2.1  Discover — find a match
•	Live search across name, department, and skills.
•	Category filter pills — Technology, Design, Business, Languages, Music & Arts, Fitness & Sports, Academic Subjects, Life Skills.
•	Bidirectional match score (0–97%) — checks whether they teach what you want AND whether you teach what they want.
•	Animated match bars that fill from 0% on render.
•	"Mutual benefit match" badge on cards with strong two-way fit.
•	Request exchange modal with a Skill Swap / Skill Coins toggle.

2.2  Profile — manage your skills
•	Profile card — name, department, live stats, Skill Coins balance.
•	Two editable lists — "Skills I can teach" and "Skills I want to learn".
•	Coin reward for listing a new teachable skill (+1).
•	Live match refresh — Discover scores update the instant your skills change.

2.3  Requests — manage exchanges
•	Three tabs — Incoming, Sent, Accepted.
•	Two request types — skill swap or a Skill Coins request.
•	Accept awards +2 coins; 
•	Nav badge shows unread incoming request count.

2.4  Schedule — book and review sessions
•	Custom calendar built in plain JavaScript, Monday-first, with session dots.
•	Day filtering — clicking a date filters the sessions panel.
•	Booking modal — person, skill, date, time, duration.
•	Star review modal — 5-star rating, +1 coin on submit.

2.5  Skill Coins economy
Action	Effect
Add a new teachable skill	+1 Skill Coin
Accept an incoming request	+2 Skill Coins
Submit a session review	+1 Skill Coin
Send a Skill Coins request	−3 Skill Coins
 
3.  File Structure
Split by feature — one file per page, one person per file — to avoid merge conflicts.

File	Owns
index.html	Page skeleton, nav bar, 4 page containers, 3 modals, Tailwind + Google Fonts
style.css	Animations and states Tailwind cannot do alone: page transitions, modal pop-in, toast
data.js	All seed data — no logic
utils.js	Shared state + helper functions used by every other file
discover.js	Search, filters, user cards, match bars, request modal
profile.js	Profile card, skill lists, add/remove
requests.js	Tabs, request cards, accept/decline
schedule.js	Calendar, sessions, booking, star reviews

Load order matters
data.js → utils.js → discover.js → profile.js → requests.js → schedule.js. Each file depends on the one before it.
 
4.  data.js — All the Data
Holds every piece of starting content. No functions, no logic — just arrays and objects that the other files read from and push into.

•	ME — Rick Kyalo: name, department, initials, avatar colour.
•	CATEGORIES — the 8 department groupings used to classify users.
•	USERS — 12 people, each with offers (skills they teach) and wants (skills they want to learn).
•	REQUESTS — swap requests with status "incoming" / "sent" / "accepted" and type "swap" / "coin".
•	SESSIONS — booked sessions with date, time, duration, calendar dot colour, reviewed flag.
•	SKILL_TAGS — the 10 individual skills shown as filter pills (AI & Automation, Web Development, Data Analysis, UI/UX Design, Digital Marketing, Cybersecurity, Cloud Computing, Sales, Public Speaking, Content Creation).
•	MONTH_NAMES, WEEK_DAYS, AVATAR_COLORS — small constants used by the calendar and avatars.
 
5.  utils.js — Shared Tools
Loaded right after data.js. Every other file depends on something declared here.

Shared state
Variable	Purpose
myOffers / myWants	Your current skill lists
myCoins	Your Skill Coins balance
activePage	Tracks which page tab is showing
sentSet	IDs of users you have already requested
nextId	Counter for new request/session IDs

Function reference
Function	Parameters	What it does
getAvatarColor(name)	name: string	Hashes the name into a consistent colour from AVATAR_COLORS — same name always gives the same colour, like Slack/GitHub avatars.
calcMatch(user)	user: object	The core matching algorithm. Counts skills they offer that I want, plus skills they want that I offer, divided by total skills, × 120, capped at 97%.
formatDate(date)	date: Date	Formats a Date object as "Monday 26 May" for the Schedule page header.
avatarHTML(name, initials, size, showOnline)	name, initials: string · size: "sm"|"md"|"lg" · showOnline: bool	Returns the HTML for a coloured initials circle, with an optional green online dot.
skillTagHTML(label, variant, showRemove, index)	label: string · variant: "offer"|"want" · showRemove: bool · index: number	Returns the HTML for a skill pill — green for offers, purple for wants — with an optional × remove button.
updateCoins()	none	Finds every element with class "coin-count" on the page and updates it to the current myCoins value.
showToast(msg, type)	msg: string · type: ""|"success"|"error"	Shows the floating notification at the bottom of the screen for 2.8 seconds, then hides it.
openModal(id) / closeModal(id)	id: string	Adds or removes the "on" class on a modal, which triggers the CSS show/hide animation.
nav(page)	page: string	Switches the visible page, updates the active nav tab, and calls that page’s render function.
boot()	none	Runs once on page load. Sets up the nav avatar, fills the session-with dropdown, wires up modal backdrop clicks, and renders the first page.
 
6.  discover.js — Find a Match
Owns the Discover page and the request exchange modal.

Function	Parameters	What it does
renderDiscover()	none	Main render function. Filters USERS by the active tag and search text, sorts by match score, builds the card grid, then animates the match bars in with a staggered delay.
renderTagFilters()	none	Builds the category filter pill buttons above the grid, highlighting whichever one is active.
setTag(tag)	tag: string	Toggles a category filter on or off, then re-renders Discover.
userCardHTML(user, index)	user: object · index: number	Returns the full HTML for one user card — avatar, badges, skill tags, match bar, and the request button.
openReqModal(userId)	userId: number	Opens the request modal for a specific user, pre-filling the dropdowns with that user’s skills and your own.
setExchangeType(type, el)	type: "swap"|"coin" · el: the clicked button element	Switches the modal between Skill Swap mode and Skill Coins mode, showing only the relevant fields.
sendRequest()	none	Validates the form, deducts coins if in coin mode, pushes a new entry to REQUESTS, marks the user as "sent", and closes the modal.
 
7.  profile.js — Manage Your Skills
Owns the Profile page — the stats card on the left, the two skill-list cards on the right.

Function	Parameters	What it does
renderProfile()	none	Calls renderProfileCard() and renderSkillSections() together.
renderProfileCard()	none	Builds the avatar, name, three live stat boxes, the Skill Coins widget, and the platform tagline.
renderSkillSections()	none	Builds both skill-list cards by calling buildSkillSection() twice — once for offers, once for wants.
buildSkillSection(type, skills, title, dotColor, placeholder)	type: "offer"|"want" · skills: array · title, placeholder: string · dotColor: CSS class	Returns the HTML for one skill-list card: header, existing tags, and the add-skill input row.
addSkill(type)	type: "offer"|"want"	Reads the input, blocks empty or duplicate entries, adds the skill, awards +1 coin for a new offer, then re-renders Profile and Discover.
removeSkill(type, index)	type: "offer"|"want" · index: number	Removes the skill at that position from the array, then re-renders Profile and Discover.
 
8.  requests.js — Handle Exchanges
Owns the Requests page — the three tabs and the accept/decline actions.

Function	Parameters	What it does
updateReqBadge()	none	Counts incoming requests and shows or hides the notification dot on the Requests nav tab.
setReqTab(tab, el)	tab: "incoming"|"sent"|"accepted" · el: clicked tab button	Switches the active tab and re-renders the request list.
renderRequests()	none	Filters REQUESTS by the active tab and builds a card for each one, or shows an empty state.
requestCardHTML(req)	req: object	Returns the HTML for one request card, showing either a swap (offer ⇄ want) or a coin request, plus the right action buttons.
acceptReq(id)	id: number	Sets the request status to "accepted", awards +2 coins, and re-renders.
declineReq(id)	id: number	Fades the card out, then removes it from REQUESTS after the animation finishes.
 
9.  schedule.js — Calendar and Reviews
Owns the Schedule page — the calendar, the sessions panel, the booking modal, and the review modal.

Function	Parameters	What it does
renderCalendar()	none	Builds the month grid from scratch — calculates the Monday-first offset, marks today, the selected day, and any days with booked sessions.
changeMonth(direction)	direction: -1 or 1	Moves the calendar back or forward one month and re-renders.
selectDay(d)	d: number (day of month)	Stores the clicked date, then re-renders the calendar and the filtered sessions panel.
renderSessions()	none	Shows either the selected day’s sessions or the next 5 upcoming sessions, each with a Rate button or a ✓ if already reviewed.
bookSession()	none	Validates the booking form and adds a new entry to SESSIONS, which immediately appears as a dot on the calendar.
openReview(sessionId)	sessionId: number	Opens the review modal for a specific session and resets the star selector.
setStar(n)	n: number (1–5)	Records the selected star rating and updates the star display.
renderStars(n)	n: number	Colours in stars 1 through n and leaves the rest grey.
submitReview()	none	Marks the session as reviewed, awards +1 coin, and closes the modal.
 
10.  Demo Script
1.	Open the app — Discover loads with 12 users sorted by match score
2.	Search "Python" — grid filters live
3.	Click a category pill — grid narrows further
4.	Click "Request exchange" on a card — show the Swap / Coin toggle
5.	Send the request — button changes, toast appears
6.	Go to Requests → Incoming — accept one, watch the coin balance rise
7.	Go to Profile — add a skill, watch the +1 coin reward
8.	Go to Schedule — click a date with a session, then rate it with stars

If asked "how is this different from LinkedIn?"
"LinkedIn is built for CVs and professional networking. SkillBridge is a marketplace with its own currency — Skill Coins — and a mutual review system. It solves a peer-learning problem, not a job-search problem."

