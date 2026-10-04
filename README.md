# Erudite
Erudite allows you to start organising your time, will help you plan out your revision, and support you in meeting those commitments. Suitable for GCSE students to University level students.

## Why is it better?
It uses clear layouts, simple colour palette, and research-proven studying methods that'll support you in attaining the highest grades. 
A common piece of advice given to students when revising for exams is to "explicitly define what you will do in that allocated study hour". With the addition of "sub-tasks" and the scheduling algorithm, Erudite will automatically input study slots into your calendar that describe exactly what you should do in that slot.  
Furthermore, you're completely in control! Drag-and-drop to reorganise your calendar, assign priorities to different tasks so the algorithm can prioritise them first, and include due dates and times so that the program not only warns you when they're upcoming, but you can also focus on those first.

## Key Features
- A Dashboard page that gives you statistics, lists out your tasks, and highlights upcoming tasks
- A Modules page that allows you to add all your subjects, courses, and topics
- A Tasks page that lists all the tasks you have but can also be filtered via modules. Add tasks, delete tasks, update tasks, create subtasks, delete subtasks, and update subtasks, all in one place
- A Calendar page with an "auto-scheduling" feature. It will divide and schedule your subtasks into the calendar. Optionally - turn it off and use the drag-and-drop, or create your schedule yourself
- A Profile page that lists your user details and core statistics

### Authentication
All user passwords are hashed using HS256 algorithm and a secret key before stored in the database.
Each login generates a 24h JWT token
A JWT token is required to access protected routes such as Dashboard, Modules, etc... unlike Login and Signup

## Installation 
1. ```pip install -r requirements.txt``` to install all the backend dependencies
2. Fill out the .env.example file as shown and rename it to .env
3. Fork the repo
4. Open terminal and run
   ```sh
   cd studyplanner/frontend
   npm run dev
   ```
5. Open a second terminal and run
   ```sh
   cd studyplanner/backend
   python -m uvicorn main:app --reload
   ```
6. It will be locally hosted on http://localhost:5173/

### Optional
PgAdmin4 can be used to inspect the PostgreSQL database.

## Implementation
Erudite was made by first creating [Pydantic] schemas, an [SQLAlchemy] models for a normalised database, and a RESTful API (via [FastAPI]) that queries the database. The frontend was created using [React], [HeroIcons] (https://heroicons.com/outline), [Mui] (https://mui.com), and [Tailwind CSS]. I use [CORSMiddleware] and [Axios] to allow the frontend to access the endpoints. It mainly uses React's useState and useEffect methods to initially load data from the database and also create the responsive interface.

## Gallery
Login Page
![Image of login page](https://github.com/chloelin07x/Erudite/blob/main/Images/LoginPage.png?raw=true)
<br/>
Signup Page
![Image of signup page](https://github.com/chloelin07x/Erudite/blob/main/Images/SignupPage.png?raw=true)
<br/>
Video demonstrating the website:
![A video that shows how to navigate the app and a couple of its' features](https://github.com/chloelin07x/Erudite/blob/main/Images/Overview.gif?raw=true)
