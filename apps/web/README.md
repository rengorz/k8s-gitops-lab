# web

Angular frontend that calls `/api/info` and shows which pod and node answered. In the cluster the Ingress
routes `/api` to the API service, so the app only uses relative URLs and needs no CORS or per-environment config.

```bash
npm ci
npm start      # http://localhost:4200, /api is proxied to http://localhost:3000
npm test
npm run build  # dist/web/browser
```
