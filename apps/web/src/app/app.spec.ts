import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('renders the pod that answered', async () => {
    const fixture = TestBed.createComponent(App);
    http.expectOne('/api/info').flush({
      app: 'lab-api',
      version: '1.0.0',
      environment: 'dev',
      pod: 'api-7d9f-abcde',
      node: 'k3d-lab-agent-0',
      time: '2026-01-01T00:00:00Z',
    });
    await fixture.whenStable();

    const text = (fixture.nativeElement as HTMLElement).textContent;
    expect(text).toContain('api-7d9f-abcde');
    expect(text).toContain('k3d-lab-agent-0');
  });

  it('shows an error when the API is down', async () => {
    const fixture = TestBed.createComponent(App);
    http.expectOne('/api/info').flush(null, { status: 503, statusText: 'Service Unavailable' });
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('API is not reachable');
  });
});
