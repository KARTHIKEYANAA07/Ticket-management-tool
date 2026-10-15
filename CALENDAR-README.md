DairyCare 360 — Service Schedule

A new Schedule page is available in the left navigation. It includes:
- A mini monthly calendar to choose a date
- Technician calendar visibility checkboxes
- Day schedule grid from 8:00 AM to 7:00 PM
- New appointment form with technician, date, start/end time, optional linked ticket, and notes/location
- Appointment search
- Appointment data saved in the browser's localStorage

Run as usual:
1. Start the Flask backend from the backend folder.
2. In frontend, run `npm install` then `npm run dev`.
3. Open the app and click Schedule in the left sidebar.

Note: Schedule appointments are currently stored in the browser, not in MySQL. They are therefore local to the browser/device. The calendar is a frontend scheduling module and does not create external notifications or sync across users yet.
