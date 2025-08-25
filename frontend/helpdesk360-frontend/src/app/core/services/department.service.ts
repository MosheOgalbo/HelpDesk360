import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Department } from '../models/department.model';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private departmentsSubject = new BehaviorSubject<Department[]>([]);
  public departments$ = this.departmentsSubject.asObservable();

  constructor(private apiService: ApiService) {
    this.loadDepartments();
  }

  getDepartments(): Observable<Department[]> {
    return this.apiService.get<Department[]>('departments').pipe(
      tap(departments => this.departmentsSubject.next(departments))
    );
  }

  private loadDepartments(): void {
    this.getDepartments().subscribe();
  }
}
