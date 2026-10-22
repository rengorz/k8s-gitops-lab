import { Component, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { Info, InfoService } from './info.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly infoService = inject(InfoService);
  private readonly hits = signal<Record<string, number>>({});

  protected readonly info = signal<Info | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly loading = signal(false);
  protected readonly pods = computed(() =>
    Object.entries(this.hits()).map(([name, count]) => ({ name, count })),
  );

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.infoService
      .get()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (info) => {
          this.info.set(info);
          this.error.set(null);
          this.hits.update((hits) => ({ ...hits, [info.pod]: (hits[info.pod] ?? 0) + 1 }));
        },
        error: () => this.error.set('API is not reachable'),
      });
  }
}
