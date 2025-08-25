import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Request, CreateRequest, UpdateRequest, PaginatedRequests } from '../models/request.model';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private requestsSubject = new BehaviorSubject<Request[]>([]);
  public requests$ = this.requestsSubject.asObservable();

  constructor(private apiService: ApiService) {}

  getRequests(page: number = 1, pageSize: number = 10): Observable<PaginatedRequests> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.apiService.get<Request[]>('requests', params).pipe(
      map((requests: Request[], response: any) => {
        // Extract pagination info from headers
        const totalCount = parseInt(response.headers?.get('X-Total-Count') || '0');
        const currentPage = parseInt(response.headers?.get('X-Page') || '1');
        const currentPageSize = parseInt(response.headers?.get('X-PageSize') || '10');

        return {
          items: requests,
          totalCount,
          page: currentPage,
          pageSize: currentPageSize,
          totalPages: Math.ceil(totalCount / currentPageSize)
        };
      }),
      tap(result => this.requestsSubject.next(result.items))
    );
  }

  getRequest(id: number): Observable<Request> {
    return this.apiService.get<Request>(`requests/${id}`);
  }

  createRequest(request: CreateRequest): Observable<Request> {
    return this.apiService.post<Request>('requests', request).pipe(
      tap(newRequest => {
        const currentRequests = this.requestsSubject.value;
        this.requestsSubject.next([newRequest, ...currentRequests]);
      })
    );
  }

  updateRequest(id: number, request: UpdateRequest): Observable<Request> {
    return this.apiService.put<Request>(`requests/${id}`, request).pipe(
      tap(updatedRequest => {
        const currentRequests = this.requestsSubject.value;
        const index = currentRequests.findIndex(r => r.id === id);
        if (index !== -1) {
          currentRequests[index] = updatedRequest;
          this.requestsSubject.next([...currentRequests]);
        }
      })
    );
  }

  deleteRequest(id: number): Observable<void> {
    return this.apiService.delete<void>(`requests/${id}`).pipe(
      tap(() => {
        const currentRequests = this.requestsSubject.value;
        const filteredRequests = currentRequests.filter(r => r.id !== id);
        this.requestsSubject.next(filteredRequests);
      })
    );
  }

  searchRequests(searchTerm: string): Observable<Request[]> {
    const params = new HttpParams().set('term', searchTerm);
    return this.apiService.get<Request[]>('requests/search', params);
  }

  // Helper methods
  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'Open': 'bg-blue-100 text-blue-800',
      'In Progress': 'bg-yellow-100 text-yellow-800',
      'Resolved': 'bg-green-100 text-green-800',
      'Closed': 'bg-gray-100 text-gray-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  }

  getPriorityClass(priority: string): string {
    const priorityClasses: { [key: string]: string } = {
      'Low': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'High': 'bg-orange-100 text-orange-800',
      'Critical': 'bg-red-100 text-red-800'
    };
    return priorityClasses[priority] || 'bg-gray-100 text-gray-800';
  }
}
