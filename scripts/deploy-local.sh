#!/bin/bash
set -e

echo -e "\033[1;36m Deploiement LOCAL (Minikube)\033[0m"
echo "=============================="

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}[1/4]${NC} Démarrage de Minikube..."
minikube start

echo -e "${BLUE}[2/4]${NC} Build des images dans Minikube..."
eval $(minikube docker-env)
docker-compose build

echo -e "${BLUE}[3/4]${NC} Déploiement des ressources Kubernetes..."
kubectl apply -f k8s/secrets.yml
kubectl apply -f k8s/postgres.yml
kubectl apply -f k8s/local/configmap-local.yml
kubectl apply -f k8s/local/backend-local.yml
kubectl apply -f k8s/local/frontend-local.yml

echo -e "${BLUE}[4/4]${NC} Redémarrage des pods..."
kubectl rollout restart deployment/backend
kubectl rollout restart deployment/frontend

echo ""
echo -e "${GREEN}Deploiement local termine !${NC}"
echo ""
echo "Acceder au frontend :"
echo "  minikube service frontend"
echo ""
echo "Verifier les pods :"
echo "  kubectl get pods"
