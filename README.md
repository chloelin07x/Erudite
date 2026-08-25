# Erudite
Erudite allows you to start organising your revision, will help you plan out your revision, and support you in meeting those commitments. Suitable for GCSE students to University level students.

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
1. Ensure that you have all the requirements from requirements.txt installed
2. Fork the repo
3. Open terminal and run
   ```sh
   cd studyplanner/frontend
   npm run dev
   ```
4. Open a second terminal and run
   ```sh
   cd studyplanner/backend
   python -m uvicorn main:app --reload
   ```
5. It will be locally hosted on http://localhost:5173/

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
