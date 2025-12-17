# 🚀 Cloud-Native URL Shortener (DevOps Portfolio)

![CI/CD Pipeline](https://img.shields.io/github/actions/workflow/status/hjali7/k3s-lab-ansible/ci-cd.yml?label=Build%20%26%20Deploy&style=for-the-badge)
![Go Version](https://img.shields.io/badge/Go-1.21-00ADD8?style=for-the-badge&logo=go)
![React Version](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Kubernetes](https://img.shields.io/badge/Kubernetes-K3s-326CE5?style=for-the-badge&logo=kubernetes)
![Docker](https://img.shields.io/badge/Docker-Multi--Stage-2496ED?style=for-the-badge&logo=docker)

A full-stack, microservices-based URL shortener application architected with **DevOps best practices**.
This project demonstrates a complete **Code-to-Production** lifecycle using **Infrastructure as Code (Ansible)**, **Container Orchestration (K8s)**, and **GitOps (GitHub Actions)**.

---

## 🏗️ Architecture

The system is designed as a distributed application running on a K3s cluster. Traffic is handled by Traefik Ingress with automatic SSL termination via Let's Encrypt.

```mermaid
graph TD
    User((User)) -->|HTTPS/443| CF[Internet / DNS]
    CF -->|Traffic| Ingress[Traefik Ingress Controller]
    
    subgraph "Kubernetes Cluster (K3s)"
        Ingress -->|Route /| Frontend[React Frontend Pods]
        Ingress -->|Route /shorten| Backend[Go Backend Pods]
        
        Backend -->|Persist Data| DB[(PostgreSQL PVC)]
        Frontend -->|API Call| Backend
    end
    
    subgraph "CI/CD Pipeline (GitHub Actions)"
        Code[Push Code] --> Build[Docker Multi-Stage Build]
        Build --> Push[Push to Docker Hub]
        Push --> Deploy[SSH Remote Deployment]
        Deploy -->|Rollout Restart| Backend & Frontend
    end

🛠️ Tech Stack
Backend (/backend)
Language: Go (Golang) 1.21

Architecture: REST API, Clean Architecture

Database: PostgreSQL (with Persistent Volume Claims)

Features: CORS support, JSON/Form handling, Optimized Docker image (~10MB).

Frontend (/frontend)
Framework: React (Vite)

Styling: Modern CSS3, Responsive Design

Features: History management (LocalStorage), Copy-to-clipboard, Real-time status.

Server: Nginx (Alpine based).

DevOps & Infrastructure
Orchestration: Kubernetes (K3s)

IaC: Ansible (Server provisioning & K3s installation)

CI/CD: GitHub Actions (Build, Push, SSH Deploy)

Security: Cert-Manager (Let's Encrypt SSL), Secrets Management

Registry: Docker Hub

📂 Repository Structure (Monorepo)

.
├── ansible/             # Infrastructure as Code (K3s setup, Server hardening)
├── backend/             # Go Microservice source code
├── frontend/            # React Source code
├── k8s-manifests/       # Kubernetes YAMLs (Deployments, Services, Ingress, Issuer)
└── .github/workflows/   # CI/CD Pipeline Configuration

🚀 Getting Started
Prerequisites
A Linux VPS (Ubuntu/Debian)

Domain pointed to the server IP (or use nip.io)

Docker Hub Account

1. Infrastructure Setup (Ansible)
Provision the server and install K3s using the provided Ansible playbooks:
cd ansible
ansible-playbook -i inventory.ini setup.yml
ansible-playbook -i inventory.ini install_k3s.yml

2. Manual Deployment (K8s)
Apply the manifests to the cluster:
# 1. Create Secrets (DB Password)
kubectl create secret generic postgres-secret --from-literal=postgres-password='YOUR_SECURE_PASS'

# 2. Deploy Database
kubectl apply -f k8s-manifests/url-shortener/postgres-storage.yml
kubectl apply -f k8s-manifests/url-shortener/postgres-deployment.yml

# 3. Deploy App & Ingress
kubectl apply -f k8s-manifests/url-shortener/app-deployment.yml
kubectl apply -f k8s-manifests/url-shortener/frontend-deployment.yml

3. CI/CD Setup
To enable automated deployments, add the following Secrets to your GitHub Repository:

DOCKERHUB_USERNAME: Your Docker Hub username.

DOCKERHUB_TOKEN: Docker Hub Access Token.

SERVER_IP: VPS IP Address.

SERVER_USER: VPS Username (e.g., root).

SSH_PRIVATE_KEY: Private SSH Key for server access.


🛡️ Security Features
HTTPS/TLS: Automated certificate management via cert-manager and Let's Encrypt.

Non-Root Containers: Backend runs as a non-privileged user (where applicable).

Secrets: Sensitive data (DB passwords) are managed via K8s Secrets, not hardcoded


Author
Built with ❤️ by alihajizadeh - DevOps