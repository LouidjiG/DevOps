#!/bin/bash
set -e

echo -e "\033[1;31m Destruction complete du cluster AKS Vote2Earn\033[0m"
echo "================================================"

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Variables
RESOURCE_GROUP="rg-vote2earn"

echo -e "${YELLOW}  ATTENTION : Cette action va supprimer :${NC}"
echo "  - Le cluster Kubernetes (AKS)"
echo "  - Le registre d'images (ACR)"
echo "  - Le groupe de ressources"
echo "  - Toutes les données (utilisateurs, votes, etc.)"
echo ""
echo -e "${YELLOW}Les identifiants Azure (Service Principal) seront conservés.${NC}"
echo ""
read -p "Êtes-vous sûr de vouloir continuer ? (yes/no) : " confirmation

if [ "$confirmation" != "yes" ]; then
    echo "Annulation de la destruction."
    exit 0
fi

echo ""
echo -e "${RED}Destruction en cours...${NC}"
cd terraform
terraform destroy -auto-approve
cd ..

echo ""
echo -e "${RED}Destruction terminee !${NC}"
echo ""
echo "Pour recréer le cluster plus tard, utilisez :"
echo "  ./scripts/deploy.sh"
