
# helpdesk360-frontend (Skeleton)

## יצירה
```bash
ng new helpdesk360-frontend --routing --style=css
cd helpdesk360-frontend
npm i -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### tailwind.config.js
```js
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: { extend: {} },
  plugins: []
};
```

### src/styles.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## שירות API בסיסי
צור `src/app/api.service.ts` שמצביע ל-`http://localhost:8080`:
```ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  listRequests() { return this.http.get(`${this.base}/requests`); }
  getRequest(id: number) { return this.http.get(`${this.base}/requests/${id}`); }
  createRequest(body: any) { return this.http.post(`${this.base}/requests`, body); }
  updateRequest(id: number, body: any) { return this.http.put(`${this.base}/requests/${id}`, body); }
  deleteRequest(id: number) { return this.http.delete(`${this.base}/requests/${id}`); }

  getMonthlyReport(year: number, month: number) {
    return this.http.get(`${this.base}/reports/monthly`, { params: { year, month } });
  }
}
```

## הרצה בדוקר (Dev)
```bash
docker-compose up
```

פתח `http://localhost:4200` לפרונט ו-`http://localhost:8080/swagger` ל-API.
