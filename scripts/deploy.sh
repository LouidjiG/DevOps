#!/bin/bash
set -e

echo " Déploiement complet du cluster AKS Vote2Earn"
echo "================================================"

# Couleurs pour les messages
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Variables
RESOURCE_GROUP="rg-vote2earn"
AKS_NAME="aks-vote2earn"
ACR_NAME="acrvote2earn"

echo -e "${BLUE}[1/6]${NC} Création de l'infrastructure Terraform..."
cd terraform
terraform init -upgrade
terraform apply -auto-approve
cd ..

echo -e "${BLUE}[2/6]${NC} Configuration de kubectl..."
az aks get-credentials --resource-group $RESOURCE_GROUP --name $AKS_NAME --overwrite-existing

echo -e "${BLUE}[3/6]${NC} Attachement de l'ACR au cluster..."
az aks update --name $AKS_NAME --resource-group $RESOURCE_GROUP --attach-acr $ACR_NAME

echo -e "${BLUE}[4/6]${NC} Login à Azure Container Registry..."
az acr login --name $ACR_NAME

echo -e "${BLUE}[5/6]${NC} Build et push des images Docker..."
docker build -t $ACR_NAME.azurecr.io/backend:latest ./backend
docker push $ACR_NAME.azurecr.io/backend:latest

docker build -t $ACR_NAME.azurecr.io/frontend:latest ./frontend
docker push $ACR_NAME.azurecr.io/frontend:latest

echo -e "${BLUE}[6/6]${NC} Déploiement sur Kubernetes..."
kubectl apply -f k8s/secrets.yml
kubectl apply -f k8s/configmap.yml
kubectl apply -f k8s/postgres.yml
kubectl apply -f k8s/backend.yml
kubectl apply -f k8s/frontend.yml

# Deploy monitoring
kubectl apply -f k8s/monitoring/prometheus.yml
kubectl apply -f k8s/monitoring/grafana.yml

echo ""
echo -e "${GREEN} Déploiement terminé !${NC}"
echo ""
echo "Attendre ~2 minutes que les pods démarrent, puis récupérer l'IP publique :"
echo "  kubectl get svc frontend"
echo ""
echo "Accès Grafana :"
echo "  kubectl get svc grafana"
