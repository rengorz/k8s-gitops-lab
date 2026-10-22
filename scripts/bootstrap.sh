#!/usr/bin/env bash
set -euo pipefail

cluster=lab

for tool in docker k3d kubectl; do
  command -v "$tool" >/dev/null || { echo "missing: $tool" >&2; exit 1; }
done

echo "==> Creating k3d cluster '$cluster'"
if k3d cluster list "$cluster" >/dev/null 2>&1; then
  echo "cluster already exists"
else
  k3d cluster create --config k3d-config.yaml
fi

echo "==> Installing Argo CD"
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -k argocd/install --server-side --force-conflicts
kubectl -n argocd rollout status deploy/argocd-server --timeout=300s
kubectl -n argocd rollout status deploy/argocd-repo-server --timeout=300s
kubectl -n argocd rollout status statefulset/argocd-application-controller --timeout=300s

echo "==> Applying root application"
kubectl apply -f argocd/root.yaml

password=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d)
cat <<EOF

Argo CD:  make argocd-ui, then https://localhost:8081 (admin / $password)
Dev:      http://dev.lab.localhost:8080
Prod:     http://prod.lab.localhost:8080
Grafana:  http://grafana.lab.localhost:8080 (admin / lab-admin)
EOF
