# GreenOps Platform

## 📊 Présentation du Projet
La **GreenOps Platform** est une plateforme SaaS dédiée à la supervision et à l'analyse des métriques énergétiques. L'objectif est de fournir une solution industrialisée, supervisée et scalable basée sur une architecture microservices.

## 🏗 Architecture Microservices
- **Frontend** : React interface pour la visualisation.
- **API Gateway (Traefik)** : Point d'entrée unique, gestion du routage et SSL.
- **Auth Service** : Gestion des utilisateurs et authentification JWT (Python FastAPI).
- **Metrics Service** : Collecte et analyse des données énergétiques (Python FastAPI).
- **Alerts Service** : Détection des seuils critiques et notifications (Python FastAPI).
- **PostgreSQL** : Persistance des données.
- **Redis** : Système de cache et stockage temporaire.
- **Monitoring Stack** : Prometheus (collecte) & Grafana (visualisation).

---

## 📅 Roadmap & Sprints

### Phase 1 : Infrastructure Docker (Sprint 1 - 3)
- [x] **Sprint 1 : Fondations & Services Communs**
    - [x] Configuration de Traefik (Reverse Proxy).
    - [x] Setup PostgreSQL & Redis.
    - [x] Initialisation du service `auth_service` avec JWT.
- [x] **Sprint 2 : Microservices & Frontend**
    - [x] Développement du `metrics_service` et `alerts_service`.
    - [x] Développement du `frontend` React.
    - [x] Orchestration avec Docker Compose.
- [x] **Sprint 3 : Observabilité & CI/CD**
    - [x] Intégration Prometheus/Grafana.
    - [x] Pipeline GitHub Actions (Tests & Build).

### Phase 2 : Migration Kubernetes (Sprint 4 - 6)
- [x] **Sprint 4 : Déploiement K8s**
    - [x] Manifests (Deployments, Services, Ingress).
    - [x] ConfigMaps & Secrets.
- [x] **Sprint 5 : Résilience & Scalabilité**
    - [x] Probes (Liveness/Readiness).
    - [x] HPA (Auto-scaling).
- [x] **Sprint 6 : Sécurité & Finalisation**
    - [x] Network Policies, RBAC.
    - [x] Documentation finale.

---

## 🚀 Installation (Phase Docker)
```bash
docker-compose -f infra/docker-compose.yml up --build
```
