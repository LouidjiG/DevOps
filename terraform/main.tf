terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

# Groupe de ressources qui contiendra tout (Cluster AKS, Registry, etc.)
resource "azurerm_resource_group" "rg" {
  name     = var.resource_group_name
  location = var.location
}
