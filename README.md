# Vote2Earn - Full-Stack Voting Platform

Application de vote avec système de récompenses, déployée sur Azure Kubernetes Service (AKS).

---

## Quick Start - Développement Local

### Option 1 : Développement Rapide (Sans Docker)

**Backend :**
```bash
cd backend
npm install
npm run dev
```
Le backend démarre sur `http://localhost:3000`

**Frontend :**
```bash
cd frontend
npm install
npm run dev
```
Le frontend démarre sur `http://localhost:5173`

---

### Option 2 : Docker Compose (Environnement Complet)

Lance toute la stack (Backend + Frontend + Postgres) :
```bash
docker-compose up --build
```

**Accès :**
- Frontend : `http://localhost:8080`
- Backend API : `http://localhost:3000`
- Postgres : `localhost:5432`

**Arrêter :**
```bash
docker-compose down
```

---

## Déploiement Kubernetes

### Cluster Local (Minikube)

**Déploiement complet :**
```bash
./scripts/deploy-local.sh
```

Ce script :
1. Démarre Minikube
2. Build les images Docker localement
3. Déploie l'application sur Kubernetes
4. Configure les services

**Accéder à l'application :**
```bash
minikube service frontend
```

**Vérifier les pods :**
```bash
kubectl get pods
```

**Arrêter Minikube :**
```bash
minikube stop
```

---

### Cluster Cloud (Azure AKS)

#### Déploiement Initial

**1. Créer l'infrastructure + Déployer l'app :**
```bash
./scripts/deploy.sh
```

**2. Récupérer l'IP publique :**
```bash
kubectl get svc frontend
```

**3. Mettre à jour le ConfigMap avec l'IP :**
Éditer `k8s/configmap.yml` et remplacer `FRONTEND_URL` par l'IP obtenue.

---

#### Mise à Jour de l'Application

**Après avoir modifié le code :**
```bash
./scripts/update.sh
```

Ce script :
1. Rebuild les images Docker
2. Les pousse vers Azure Container Registry
3. Redéploie sur AKS
4. Redémarre les pods

---

#### Destruction du Cluster

**Pour économiser les crédits Azure :**
```bash
./scripts/destroy.sh
```

**ATTENTION** : Cela supprime toutes les données !

---

## CI/CD Pipeline (GitHub Actions)

### Workflow Automatique

À chaque `git push` sur les branches `main` ou `Killian`, GitHub Actions :

1. **Teste le Backend** (`npm test`)
2. **Build le Frontend** (`npm run build`)
3. **Vérifie si l'infrastructure Azure existe**
4. **Build et Push les images Docker vers ACR**
5. **Déploie sur AKS** (si l'infra existe)

---

## Ajouter des Tests au CI/CD

### Backend

**Fichier de tests :** `backend/src/__tests__/`

**Exemple de test :**
```typescript
// backend/src/__tests__/auth.test.ts
import request from 'supertest';
import app from '../index';

describe('Auth API', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
    expect(res.statusCode).toBe(201);
  });
});
```

**Lancer les tests localement :**
```bash
cd backend
npm test
```

Les tests sont **automatiquement exécutés** par GitHub Actions dans le job `backend-test`.

---

### Frontend

**Fichier de tests :** `frontend/src/__tests__/`

**Exemple de test :**
```typescript
// frontend/src/__tests__/App.test.tsx
import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders app title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Vote2Earn/i);
  expect(titleElement).toBeInTheDocument();
});
```

**Lancer les tests localement :**
```bash
cd frontend
npm test
```

Pour ajouter des tests au CI/CD, ils seront automatiquement détectés par `npm test`.

---

## Structure du Projet

```
DevOps/
├── backend/              # API Node.js + Express + Sequelize
│   ├── src/
│   │   ├── __tests__/    # ⚠️ Ajouter vos tests ici
│   │   ├── routes/       # Routes API
│   │   ├── models/       # Modèles Sequelize
│   │   └── index.ts      # Point d'entrée
│   └── Dockerfile
│
├── frontend/             # React + TypeScript + Vite
│   ├── src/
│   │   ├── __tests__/    # ⚠️ Ajouter vos tests ici
│   │   ├── pages/        # Pages React
│   │   └── lib/          # Utilitaires (API, Axios)
│   └── Dockerfile
│
├── k8s/                  # Manifests Kubernetes (BASE)
│   ├── backend.yml       # Deployment + Service Backend
│   ├── frontend.yml      # Deployment + Service Frontend
│   ├── postgres.yml      # Base de données
│   ├── configmap.yml     # Variables d'environnement
│   ├── secrets.yml       # ⚠️ NE PAS COMMIT (mots de passe)
│   ├── local/            # Overrides pour Minikube
│   └── monitoring/       # Prometheus + Grafana
│
├── terraform/            # Infrastructure as Code (Azure)
│   ├── main.tf           # Configuration principale
│   ├── aks.tf            # Cluster Kubernetes
│   └── acr.tf            # Container Registry
│
├── scripts/              # Scripts d'automatisation
│   ├── deploy.sh         # Déploiement cloud complet
│   ├── deploy-local.sh   # Déploiement local (Minikube)
│   ├── update.sh         # Mise à jour cloud
│   └── destroy.sh        # Destruction infrastructure
│
├── .github/workflows/    # CI/CD
│   └── ci.yml            # Pipeline GitHub Actions
│
└── docker-compose.yml    # Orchestration locale
```

---

## Fichiers Sensibles (NE PAS COMMIT)

Ces fichiers contiennent des secrets et sont dans `.gitignore` :

- `k8s/secrets.yml` - Mots de passe Kubernetes
- `terraform/*.tfstate` - État Terraform (contient des IDs)
- `terraform/*.tfstate.lock.info` - Fichier de verrouillage
- `.env` - Variables d'environnement locales
- `backend/.env` - Configuration backend locale
- `frontend/.env` - Configuration frontend locale

---

## Commandes Utiles

### Kubernetes

```bash
# Voir tous les pods
kubectl get pods

# Voir les logs d'un pod
kubectl logs <pod-name>

# Voir les services (et IPs publiques)
kubectl get svc

# Redémarrer un deployment
kubectl rollout restart deployment/<name>

# Supprimer un pod (il sera recréé automatiquement)
kubectl delete pod <pod-name>
```

### Docker

```bash
# Voir les images locales
docker images

# Voir les conteneurs en cours
docker ps

# Nettoyer les images inutilisées
docker system prune -a
```

### Terraform

```bash
cd terraform

# Voir l'état actuel
terraform show

# Planifier les changements
terraform plan

# Appliquer les changements
terraform apply

# Détruire l'infrastructure
terraform destroy
```

---

## Monitoring (Grafana + Prometheus)

**Accès Grafana :**
```bash
kubectl get svc grafana
```

Utilise l'IP externe affichée : `http://<EXTERNAL-IP>:3000`

**Identifiants par défaut :**
- Username: `admin`
- Password: `admin`

**Configuration :**
1. Ajouter Prometheus comme source de données : `http://prometheus:9090`
2. Importer un dashboard : ID `13332` (Kubernetes Cluster Monitoring)

---

## Troubleshooting

### Le pod crashe en boucle

```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

### Erreur CORS sur le frontend

Vérifier que `FRONTEND_URL` dans `k8s/configmap.yml` correspond à l'IP publique du frontend.

### Impossible de se connecter à la base de données

Vérifier que le secret `DB_PASSWORD` est bien défini dans `k8s/secrets.yml`.

### Les images ne se mettent pas à jour

Forcer le redémarrage :
```bash
kubectl rollout restart deployment/backend
kubectl rollout restart deployment/frontend
```

---

## Workflow d'Équipe

### Pour les Développeurs Frontend/Backend

1. **Développer en local** : `npm run dev`
2. **Tester** : `npm test`
3. **Commit & Push** : Le CI/CD s'occupe du reste
4. **Vérifier** : GitHub Actions → Onglet "Actions"

### Pour le DevOps

1. **Gérer l'infrastructure** : Scripts dans `scripts/`
2. **Monitorer** : Grafana
3. **Débugger** : `kubectl logs` et `kubectl describe`
4. **Optimiser** : Ajuster les ressources dans les manifests

---

## Notes Importantes

- **Coût Azure** : Détruire le cluster chaque soir avec `./scripts/destroy.sh`
- **Secrets** : Ne JAMAIS commit `secrets.yml` ou `.env`
- **Tests** : Ajouter des tests dans `__tests__/` pour qu'ils soient exécutés par le CI/CD
- **IP Publique** : Change à chaque redéploiement, penser à mettre à jour `FRONTEND_URL`

---

## Ressources

- [Documentation Kubernetes](https://kubernetes.io/docs/)
- [Terraform Azure Provider](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Prometheus Queries](https://prometheus.io/docs/prometheus/latest/querying/basics/)

---

**Projet réalisé dans le cadre du cours DevOps - 2024/2025**
