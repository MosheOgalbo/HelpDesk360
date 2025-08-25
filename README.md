
# HelpDesk360 — Mono Repo

מערכת **HelpDesk360**: Backend ב-.NET 8 + Frontend ב-Angular + SQL Server + Docker Compose.

## מבנה
```
/HelpDesk360
  /HelpDesk360.API         # Web API (.NET 8)
  /helpdesk360-frontend    # Angular App (skeleton)
  /sql                     # SQL schema + Stored Procedure
  docker-compose.yml
```

## דרישות משימה — מיפוי ליישום
1. **SQL**  
   - פרוצדורה `sp_MonthlySupportReport` מחזירה:
     - סה״כ פניות למחלקה בחודש המבוקש
     - השוואה לחודש קודם
     - השוואה לאותו חודש בשנה שעברה  
   - אופטימיזציה: אינדקסים, חלוקת טבלאות נפרדת למחלקות, שימוש ב-`FULL OUTER JOIN` לאיחוד.

2. **Backend (.NET 8 Web API)**
   - מודל `SupportRequest` עם `Department[]` במבנה many-to-many.
   - CRUD מלא + endpoint לדוח (`/api/reports/monthly`).
   - README, CORS, Swagger, ולידציה, seed למחלקות.

3. **Frontend (Angular + TailwindCSS)**
   - הפקודות:
     ```bash
     npm i -g @angular/cli
     ng new helpdesk360-frontend --routing --style=css
     cd helpdesk360-frontend
     npm i -D tailwindcss postcss autoprefixer
     npx tailwindcss init -p
     ```
   - קונפיגורציית Tailwind:
     - ב-`tailwind.config.js`: `content: ["./src/**/*.{html,ts}"]`
     - ב-`src/styles.css`: `@tailwind base; @tailwind components; @tailwind utilities;`
   - קומפוננטות מוצעות:
     - `request-form` (שם, טל׳, אימייל, מחלקות מרובות, תיאור) עם `ReactiveForms`.
     - `report-page` שמביאה נתונים מ-`/api/reports/monthly` ומציגה טבלה/גרף (Bonus: Angular Material/PrimeNG).

4. **Docker**
   - `docker-compose.yml` מפעיל SQL Server, API, ו-Frontend (Node dev server).
   - פקודות:
     ```bash
     docker-compose build
     docker-compose up
     docker-compose down -v
     ```

## קונפיגורציית Tailwind (דוגמה)
```js
// helpdesk360-frontend/tailwind.config.js
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: { extend: {} },
  plugins: []
};
```
