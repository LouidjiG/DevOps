variable "resource_group_name" {
  description = "Nom du Resource Group Azure"
  default     = "rg-vote2earn"
}

variable "location" {
  description = "Région Azure (France Central est bien pour ESIEE)"
  default     = "France Central"
}

variable "cluster_name" {
  description = "Nom du cluster Kubernetes"
  default     = "aks-vote2earn"
}

variable "acr_name" {
  description = "Nom du Container Registry (Doit être unique mondialement !)"
  default     = "acrvote2earn" # Tu devras peut-être le changer s'il est pris
}
