resource "azurerm_kubernetes_cluster" "aks" {
  name                = var.cluster_name
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  dns_prefix          = "vote2earn-dns"

  default_node_pool {
    name       = "default"
    node_count = 1
    vm_size    = "Standard_B2s" # Optimisé coût (Burstable)
  }

  identity {
    type = "SystemAssigned"
  }

  tags = {
    Environment = "Production"
  }
}

# La permission AcrPull sera configurée manuellement car le Service Principal Terraform n'a pas les droits "Owner"
# resource "azurerm_role_assignment" "aks_acr_pull" { ... }
