
# HelpDesk360.API

## מבנה הפרויקט
```
HelpDesk360.API/
  Controllers/
    RequestsController.cs
    ReportsController.cs
  Data/
    AppDbContext.cs
  Models/
    SupportRequest.cs
  Program.cs
  appsettings.json
  Dockerfile
```

## טכנולוגיות נבחרות — יתרונות וחסרונות
- **.NET 8 Web API + EF Core (SQL Server)**  
  יתרונות: ביצועים גבוהים, תמיכה מעולה ב-LINQ, הגירות.  
  חסרונות: לימוד EF Core ושכבת נתונים מופרדת דורש משמעת.

- **CORS + Swagger**  
  מאפשר עבודה מול פרונט מקומי ותיעוד API.

## אבטחה ו-Error Handling
- ולידציה בצד השרת עם DataAnnotations.
- החזרת `ValidationProblemDetails` לשגיאות מודל.
- CORS מוגדר רק למקורות המותרים (`appsettings.json`).
- מומלץ להוסיף Rate Limiting ו-API Key/JWT בסביבת PROD.

## הפעלת הפרויקט (מקומית)
```bash
# יצירת DB והרצת SQL (אופציונלי, ניתן דרך docker-compose)
sqlcmd -S localhost,1433 -U sa -P YourStrong!Passw0rd -C -i ./sql/01_schema_and_report.sql

# הפעלת Docker Compose
docker-compose build
docker-compose up
```

ה-API יעלה על `http://localhost:8080` עם Swagger בנתיב `/swagger`.

## קריאות API
- `GET /api/requests`
- `GET /api/requests/{id}`
- `POST /api/requests`
- `PUT /api/requests/{id}`
- `DELETE /api/requests/{id}`
- `GET /api/reports/monthly?year=2025&month=8`

## בדיקות יחידה (כיוונון)
מומלץ ליצור פרויקט בדיקות נפרד `HelpDesk360.Tests` ולהוסיף בדיקות ל-Controllers (Happy/Unhappy).

## אופטימיזציה
- אינדקסים על CreatedAtUtc וקישור למחלקות (מוגדר בסקריפט).
- טעינת Include רק בעת הצורך (כפי שמוגדר ב-GET).
- שימוש ב-`AsNoTracking()` לקריאות קריאה גרידא.
