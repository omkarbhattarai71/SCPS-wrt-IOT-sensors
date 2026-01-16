# GKE Deployment Guide

This directory contains Kubernetes manifests optimized for Google Kubernetes Engine (GKE).

## Prerequisites

1. **Google Cloud SDK installed**
   ```bash
   # Install from: https://cloud.google.com/sdk/docs/install
   ```

2. **Docker installed** (for building and pushing images)

3. **GCP Project with billing enabled**

## Setup Steps

### 1. Authenticate and Configure GCP

```bash
# Login to Google Cloud
gcloud auth login

# Set your project ID
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable container.googleapis.com
gcloud services enable compute.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### 2. Create GKE Cluster

```bash
# Create a regional cluster with autoscaling
gcloud container clusters create smart-parking-cluster \
  --region eu-west1 \
  --num-nodes 3 \
  --machine-type e2-standard-2 \
  --disk-size 30 \
  --enable-autoscaling --min-nodes 2 --max-nodes 5 \
  --enable-autorepair \
  --enable-autoupgrade

# Get cluster credentials
gcloud container clusters get-credentials smart-parking-cluster --region eu-west1

# Verify cluster connection
kubectl cluster-info
kubectl get nodes
```

### 3. Build and Push Docker Images

```bash
# Configure Docker to use GCR
gcloud auth configure-docker

# Build images (from repository root)
# GKE nodes run on AMD64 architecture
docker buildx build --platform linux/amd64 -t gcr.io/YOUR_PROJECT_ID/smart-parking-backend:latest --push -f backend/Dockerfile backend
docker buildx build --platform linux/amd64 -t gcr.io/YOUR_PROJECT_ID/smart-parking-predict:latest --push -f backend/prediction_service/Dockerfile backend

# For frontend, you need to rebuild with GKE backend URL
# First deploy backend, get its external IP, then build frontend
# See step 6 below
```

### 4. Configure Secrets and Environment Variables

```bash
# Copy the example environment file
cp k8s-gke/.env.example k8s-gke/.env

# Edit k8s-gke/.env and fill in your values:
# - GCP_PROJECT_ID: Your GCP project ID
# - Firebase configuration (from your Firebase console or root .env file)
# - Backend IP will be filled after deploying backend (step 6)

# Copy and configure database secrets
cp k8s-gke/postgres-config.yaml.example k8s-gke/postgres-config.yaml
# Edit postgres-config.yaml to set secure database credentials

# Copy and configure backend secrets
cp k8s-gke/backend-config.yaml.example k8s-gke/backend-config.yaml
# Edit backend-config.yaml to set Django secret key and other configuration
```

### 5. Deploy Backend Services

```bash
# Apply manifests in order
kubectl apply -f k8s-gke/namespace.yaml
kubectl apply -f k8s-gke/postgres-config.yaml
kubectl apply -f k8s-gke/postgres.yaml
kubectl apply -f k8s-gke/backend-config.yaml
kubectl apply -f k8s-gke/backend.yaml
kubectl apply -f k8s-gke/predict.yaml

# Wait for backend LoadBalancer to get external IP (takes 1-2 minutes)
kubectl get svc backend -n smart-parking --watch

# Note the EXTERNAL-IP and update k8s-gke/.env with:
# BACKEND_EXTERNAL_IP=<the-ip-you-see>
# REACT_APP_API_URL=http://<the-ip-you-see>:8000
```

### 6. Build and Deploy Frontend

**Load environment variables from k8s-gke/.env:**

```bash
# Bash/Zsh (macOS/Linux): Load variables from k8s-gke/.env
# This handles files with Windows line endings (CRLF) and filters out comments
export $(grep -v '^#' k8s-gke/.env | grep -v '^$' | tr -d '\r' | xargs)

# Verify critical variables are loaded
echo "GCP_PROJECT_ID: $GCP_PROJECT_ID"
echo "REACT_APP_API_URL: $REACT_APP_API_URL"
echo "REACT_APP_FIREBASE_API_KEY: ${REACT_APP_FIREBASE_API_KEY:0:20}..." # Show first 20 chars only

# If variables are empty, manually export each variable:
export GCP_PROJECT_ID=$(grep '^GCP_PROJECT_ID=' k8s-gke/.env | cut -d '=' -f2)
export REACT_APP_API_URL=$(grep '^REACT_APP_API_URL=' k8s-gke/.env | cut -d '=' -f2)
export REACT_APP_FIREBASE_API_KEY=$(grep '^REACT_APP_FIREBASE_API_KEY=' k8s-gke/.env | cut -d '=' -f2)
export REACT_APP_FIREBASE_AUTH_DOMAIN=$(grep '^REACT_APP_FIREBASE_AUTH_DOMAIN=' k8s-gke/.env | cut -d '=' -f2)
export REACT_APP_FIREBASE_PROJECT_ID=$(grep '^REACT_APP_FIREBASE_PROJECT_ID=' k8s-gke/.env | cut -d '=' -f2)
export REACT_APP_FIREBASE_STORAGE_BUCKET=$(grep '^REACT_APP_FIREBASE_STORAGE_BUCKET=' k8s-gke/.env | cut -d '=' -f2)
export REACT_APP_FIREBASE_MESSAGING_SENDER_ID=$(grep '^REACT_APP_FIREBASE_MESSAGING_SENDER_ID=' k8s-gke/.env | cut -d '=' -f2)
export REACT_APP_FIREBASE_APP_ID=$(grep '^REACT_APP_FIREBASE_APP_ID=' k8s-gke/.env | cut -d '=' -f2)
export REACT_APP_FIREBASE_MEASUREMENT_ID=$(grep '^REACT_APP_FIREBASE_MEASUREMENT_ID=' k8s-gke/.env | cut -d '=' -f2)

# IMPORTANT: Build frontend image for AMD64 (GKE compatibility)
# The --no-cache flag ensures environment variables are freshly baked into the image
# Use docker buildx for cross-platform builds on Apple Silicon
# --no-cache ensures fresh build with current environment variables
docker buildx build --platform linux/amd64 --no-cache \
  -t gcr.io/$GCP_PROJECT_ID/smart-parking-frontend:latest \
  --build-arg REACT_APP_API_URL=$REACT_APP_API_URL \
  --build-arg REACT_APP_FIREBASE_API_KEY=$REACT_APP_FIREBASE_API_KEY \
  --build-arg REACT_APP_FIREBASE_AUTH_DOMAIN=$REACT_APP_FIREBASE_AUTH_DOMAIN \
  --build-arg REACT_APP_FIREBASE_PROJECT_ID=$REACT_APP_FIREBASE_PROJECT_ID \
  --build-arg REACT_APP_FIREBASE_STORAGE_BUCKET=$REACT_APP_FIREBASE_STORAGE_BUCKET \
  --build-arg REACT_APP_FIREBASE_MESSAGING_SENDER_ID=$REACT_APP_FIREBASE_MESSAGING_SENDER_ID \
  --build-arg REACT_APP_FIREBASE_APP_ID=$REACT_APP_FIREBASE_APP_ID \
  --build-arg REACT_APP_FIREBASE_MEASUREMENT_ID=$REACT_APP_FIREBASE_MEASUREMENT_ID \
  --push \
  smartparking

# Note: --push automatically pushes to GCR after building
# After successful build, restart the deployment to use the new image
kubectl rollout restart deployment/frontend -n smart-parking
kubectl rollout status deployment/frontend -n smart-parking

# Verify Firebase config is in the deployed container (should show your API key)
kubectl exec -n smart-parking deployment/frontend -- env | grep REACT_APP

# Deploy frontend
kubectl apply -f k8s-gke/frontend.yaml

# Get frontend external IP
kubectl get svc frontend -n smart-parking --watch
```

### 7. Update CORS Configuration

```bash
# Get frontend external IP
FRONTEND_IP=$(kubectl get svc frontend -n smart-parking -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "Frontend IP: $FRONTEND_IP"

# Edit backend-config.yaml and add the frontend IP to CORS_ALLOWED_ORIGINS
# CORS_ALLOWED_ORIGINS: "http://<frontend-ip>,http://localhost"

# Reapply configuration
kubectl apply -f k8s-gke/backend-config.yaml
kubectl rollout restart deployment/backend -n smart-parking

# Wait for backend to restart
kubectl rollout status deployment/backend -n smart-parking
```

### 8. Create Django Superuser

```bash
kubectl exec -it deployment/backend -n smart-parking -- python manage.py createsuperuser
```

### 9. Access Your Application

```bash
# Get frontend URL
FRONTEND_IP=$(kubectl get svc frontend -n smart-parking -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "Frontend: http://$FRONTEND_IP"

# Get backend URL
BACKEND_IP=$(kubectl get svc backend -n smart-parking -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "Backend: http://$BACKEND_IP:8000"
echo "Admin: http://$BACKEND_IP:8000/admin/"
```

## Cost Optimization

- Use **Autopilot** mode for fully managed, cost-optimized cluster
- Enable **cluster autoscaling** to scale down during low usage
- Use **preemptible nodes** for non-production workloads
- Set up **budget alerts** in GCP Console

### Scale Down When Not in Use

```powershell
# Scale down deployments to save costs
kubectl scale deployment/backend --replicas=1 -n smart-parking
kubectl scale deployment/predict --replicas=1 -n smart-parking
kubectl scale deployment/frontend --replicas=1 -n smart-parking
```

### Scale Back Up

```powershell
# Scale back up for production load
kubectl scale deployment/backend --replicas=2 -n smart-parking
kubectl scale deployment/predict --replicas=2 -n smart-parking
kubectl scale deployment/frontend --replicas=2 -n smart-parking
```

## Cleanup

```bash
# Delete the cluster (this will delete all resources)
gcloud container clusters delete smart-parking-cluster --region eu-west1

# Delete container images
gcloud container images delete gcr.io/YOUR_PROJECT_ID/smart-parking-backend:latest --quiet
gcloud container images delete gcr.io/YOUR_PROJECT_ID/smart-parking-predict:latest --quiet
gcloud container images delete gcr.io/YOUR_PROJECT_ID/smart-parking-frontend:latest --quiet
```

## Troubleshooting

### View Logs
```bash
# Follow logs in real-time
kubectl logs -f deployment/backend -n smart-parking
kubectl logs -f deployment/predict -n smart-parking
kubectl logs -f deployment/frontend -n smart-parking

# View previous container logs (for crashed pods)
kubectl logs <pod-name> -n smart-parking --previous

# View logs for all pods with a label
kubectl logs -l app=backend -n smart-parking --all-containers=true
```

### Monitor Resources
```powershell
# Check pod status
kubectl get pods -n smart-parking

# Check pod resource usage
kubectl top pods -n smart-parking

# Check node resource usage
kubectl top nodes

# Get events sorted by timestamp
kubectl get events -n smart-parking --sort-by='.lastTimestamp'

# Describe a pod for detailed info
kubectl describe pod <pod-name> -n smart-parking
```

### Check Services
```bash
# List all services
kubectl get svc -n smart-parking

# Describe a service
kubectl describe svc backend -n smart-parking

# Get external IPs
kubectl get svc -n smart-parking -o wide
```

### Debug Inside Containers
```bash
# Open a shell in a container
kubectl exec -it deployment/backend -n smart-parking -- /bin/bash

# Run a command in a container
kubectl exec deployment/backend -n smart-parking -- python manage.py showmigrations
```