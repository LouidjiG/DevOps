#!/bin/bash
set -e

echo -e "\033[1;36m Mise a jour du cluster AKS Vote2Earn\033[0m"
echo "========================================"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
ACR_NAME="acrvote2earn"

echo -e "${BLUE}[1/4]${NC} Login à Azure Container Registry..."
az acr login --name $ACR_NAME

echo -e "${BLUE}[2/4]${NC} Build et push des nouvelles images Docker..."
docker build -t $ACR_NAME.azurecr.io/backend:latest ./backend
docker push $ACR_NAME.azurecr.io/backend:latest

docker build -t $ACR_NAME.azurecr.io/frontend:latest ./frontend
docker push $ACR_NAME.azurecr.io/frontend:latest

echo -e "${BLUE}[3/4]${NC} Mise à jour des manifests Kubernetes..."
kubectl apply -f k8s/configmap.yml
kubectl apply -f k8s/postgres.yml
kubectl apply -f k8s/backend.yml
kubectl apply -f k8s/frontend.yml

# Update monitoring
kubectl apply -f k8s/monitoring/prometheus.yml
kubectl apply -f k8s/monitoring/grafana.yml

echo -e "${BLUE}[4/4]${NC} Redémarrage des pods pour charger les nouvelles images..."
kubectl rollout restart deployment/backend
kubectl rollout restart deployment/frontend

echo ""
echo -e "${GREEN} Mise à jour terminée !${NC}"
echo ""
echo "Vérifier le statut des pods :"
echo "  kubectl get pods"
echo ""
echo "Suivre le redémarrage en temps réel :"
echo "  kubectl get pods -w"
