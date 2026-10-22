ENV ?= dev
REQUESTS ?= 500
CONCURRENCY ?= 10

.PHONY: help up down status argocd-ui logs-dev load test-api

help: ## Show available targets
	@grep -E '^[a-z-]+:.*##' $(MAKEFILE_LIST) | awk -F ':.*## ' '{printf "%-12s %s\n", $$1, $$2}'

up: ## Create the cluster, install Argo CD and hand over to GitOps
	./scripts/bootstrap.sh

down: ## Delete the cluster
	./scripts/teardown.sh

status: ## Show Argo CD applications and lab pods
	kubectl -n argocd get applications
	kubectl -n lab-dev get pods -o wide
	kubectl -n lab-prod get pods -o wide

argocd-ui: ## Port-forward the Argo CD UI to https://localhost:8081
	kubectl -n argocd port-forward svc/argocd-server 8081:443

logs-dev: ## Follow API logs in dev
	kubectl -n lab-dev logs -l app.kubernetes.io/name=api -f --max-log-requests 10

load: ## Generate traffic, e.g. make load ENV=prod REQUESTS=5000 CONCURRENCY=20
	./scripts/load-test.sh $(ENV) $(REQUESTS) $(CONCURRENCY)

test-api: ## Run API unit tests
	cd apps/api && npm ci && npm test
