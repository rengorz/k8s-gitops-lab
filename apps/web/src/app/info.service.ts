import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface Info {
  app: string;
  version: string;
  environment: string;
  pod: string;
  node: string;
  time: string;
}

@Injectable({ providedIn: 'root' })
export class InfoService {
  private readonly http = inject(HttpClient);

  get(): Observable<Info> {
    return this.http.get<Info>('/api/info');
  }
}
