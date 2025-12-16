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
  --region us-central1 \
  --num-nodes 3 \
  --machine-type e2-standard-2 \
  --disk-size 30 \
  --enable-autoscaling --min-nodes 2 --max-nodes 5 \
  --enable-autorepair \
  --enable-autoupgrade

# Get cluster credentials
gcloud container clusters get-credentials smart-parking-cluster --region us-central1
```

### 3. Build and Push Docker Images

```bash
# Configure Docker to use GCR
gcloud auth configure-docker

# Build images (from repository root)
docker build -t gcr.io/YOUR_PROJECT_ID/smart-parking-backend:latest -f backend/Dockerfile backend
docker build -t gcr.io/YOUR_PROJECT_ID/smart-parking-predict:latest -f backend/prediction_service/Dockerfile backend

# For frontend, you need to rebuild with GKE backend URL
# First deploy backend, get its external IP, then build frontend
# See step 5 below

# Push backend and predict images
docker push gcr.io/YOUR_PROJECT_ID/smart-parking-backend:latest
docker push gcr.io/YOUR_PROJECT_ID/smart-parking-predict:latest
```

### 4. Update Manifests

Replace `YOUR_PROJECT_ID` in all YAML files:

```bash
# Linux/Mac
sed -i 's/YOUR_PROJECT_ID/your-actual-project-id/g' k8s-gke/*.yaml

# Windows PowerShell
Get-ChildItem k8s-gke\*.yaml | ForEach-Object {
  (Get-Content $_.FullName) -replace 'YOUR_PROJECT_ID', 'your-actual-project-id' | Set-Content $_.FullName
}
```

### 5. Configure Environment Variables

```bash
# Copy the example environment file
cp k8s-gke/.env.example k8s-gke/.env

# Edit k8s-gke/.env and fill in your values:
# - GCP_PROJECT_ID: Your GCP project ID
# - Firebase configuration (from your Firebase console or root .env file)
# - Backend IP will be filled after deploying backend (step 6)
```

### 6. Deploy Backend Services

```bash
# Apply manifests in order
kubectl apply -f k8s-gke/namespace.yaml
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

### 7. Build and Deploy Frontend

**Load environment variables from k8s-gke/.env:**

```powershell
# PowerShell: Load variables from k8s-gke/.env
$env:GCP_PROJECT_ID = (Select-String -Path "k8s-gke\.env" -Pattern "^GCP_PROJECT_ID=(.+)$").Matches.Groups[1].Value
$env:REACT_APP_API_URL = (Select-String -Path "k8s-gke\.env" -Pattern "^REACT_APP_API_URL=(.+)$").Matches.Groups[1].Value
$env:REACT_APP_FIREBASE_API_KEY = (Select-String -Path "k8s-gke\.env" -Pattern "^REACT_APP_FIREBASE_API_KEY=(.+)$").Matches.Groups[1].Value
$env:REACT_APP_FIREBASE_AUTH_DOMAIN = (Select-String -Path "k8s-gke\.env" -Pattern "^REACT_APP_FIREBASE_AUTH_DOMAIN=(.+)$").Matches.Groups[1].Value
$env:REACT_APP_FIREBASE_PROJECT_ID = (Select-String -Path "k8s-gke\.env" -Pattern "^REACT_APP_FIREBASE_PROJECT_ID=(.+)$").Matches.Groups[1].Value
$env:REACT_APP_FIREBASE_STORAGE_BUCKET = (Select-String -Path "k8s-gke\.env" -Pattern "^REACT_APP_FIREBASE_STORAGE_BUCKET=(.+)$").Matches.Groups[1].Value
$env:REACT_APP_FIREBASE_MESSAGING_SENDER_ID = (Select-String -Path "k8s-gke\.env" -Pattern "^REACT_APP_FIREBASE_MESSAGING_SENDER_ID=(.+)$").Matches.Groups[1].Value
$env:REACT_APP_FIREBASE_APP_ID = (Select-String -Path "k8s-gke\.env" -Pattern "^REACT_APP_FIREBASE_APP_ID=(.+)$").Matches.Groups[1].Value
$env:REACT_APP_FIREBASE_MEASUREMENT_ID = (Select-String -Path "k8s-gke\.env" -Pattern "^REACT_APP_FIREBASE_MEASUREMENT_ID=(.+)$").Matches.Groups[1].Value

# Build frontend image
docker build -t gcr.io/$env:GCP_PROJECT_ID/smart-parking-frontend:latest `
  --build-arg REACT_APP_API_URL=$env:REACT_APP_API_URL `
  --build-arg REACT_APP_FIREBASE_API_KEY=$env:REACT_APP_FIREBASE_API_KEY `
  --build-arg REACT_APP_FIREBASE_AUTH_DOMAIN=$env:REACT_APP_FIREBASE_AUTH_DOMAIN `
  --build-arg REACT_APP_FIREBASE_PROJECT_ID=$env:REACT_APP_FIREBASE_PROJECT_ID `
  --build-arg REACT_APP_FIREBASE_STORAGE_BUCKET=$env:REACT_APP_FIREBASE_STORAGE_BUCKET `
  --build-arg REACT_APP_FIREBASE_MESSAGING_SENDER_ID=$env:REACT_APP_FIREBASE_MESSAGING_SENDER_ID `
  --build-arg REACT_APP_FIREBASE_APP_ID=$env:REACT_APP_FIREBASE_APP_ID `
  --build-arg REACT_APP_FIREBASE_MEASUREMENT_ID=$env:REACT_APP_FIREBASE_MEASUREMENT_ID `
  smartparking

# Push to GCR
docker push gcr.io/$env:GCP_PROJECT_ID/smart-parking-frontend:latest

# Deploy frontend
kubectl apply -f k8s-gke/frontend.yaml

# Get frontend external IP
kubectl get svc frontend -n smart-parking --watch
```

### 8. Update CORS Configuration

```bash
# Get frontend external IP
FRONTEND_IP=$(kubectl get svc frontend -n smart-parking -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

# Update backend-config.yaml CORS_ALLOWED_ORIGINS with frontend IP
# Then reapply
kubectl apply -f k8s-gke/backend-config.yaml
kubectl rollout restart deployment/backend -n smart-parking
```

### 9. Create Django Superuser

```bash
kubectl exec -it deployment/backend -n smart-parking -- python manage.py createsuperuser
```

### 10. Access Your Application

```bash
# Get frontend URL
FRONTEND_IP=$(kubectl get svc frontend -n smart-parking -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "Frontend: http://$FRONTEND_IP"

# Get backend URL
BACKEND_IP=$(kubectl get svc backend -n smart-parking -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "Backend: http://$BACKEND_IP:8000"
echo "Admin: http://$BACKEND_IP:8000/admin/"
```

## Production Recommendations

### 1. Use Google Secret Manager

Instead of storing secrets in YAML files, use Google Secret Manager:

```bash
# Create secrets
echo -n "your-django-secret-key" | gcloud secrets create django-secret-key --data-file=-
echo -n "your-postgres-password" | gcloud secrets create postgres-password --data-file=-

# Enable Workload Identity
gcloud iam service-accounts create gke-smart-parking
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:gke-smart-parking@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 2. Use Cloud SQL Instead of In-Cluster PostgreSQL

```bash
# Create Cloud SQL instance
gcloud sql instances create smart-parking-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1

# Enable PostGIS
gcloud sql databases create smart_city_parking_db --instance=smart-parking-db
```

### 3. Set Up HTTPS with Managed Certificates

```bash
# Reserve a static IP
gcloud compute addresses create smart-parking-ip --global

# Create managed certificate (requires domain)
gcloud compute ssl-certificates create smart-parking-cert \
  --domains=yourdomain.com
```

### 4. Enable Cloud Monitoring

```bash
# Install monitoring agent
kubectl apply -f https://storage.googleapis.com/gke-release/monitoring/latest/gmp-operator.yaml
```

### 5. Set Up CI/CD with Cloud Build

Create `cloudbuild.yaml` for automated builds and deployments.

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
gcloud container clusters delete smart-parking-cluster --region us-central1

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

### Common Issues and Solutions

#### Issue: Pods in CrashLoopBackOff
**Symptoms:** Pod keeps restarting
```powershell
# Check logs for errors
kubectl logs <pod-name> -n smart-parking --previous

# Common causes:
# - Database connection failures (check postgres pod is running)
# - Missing environment variables (check configmap/secrets)
# - Application errors (check application logs)
```

#### Issue: LoadBalancer Stuck in Pending
**Symptoms:** External IP shows as `<pending>`
```powershell
# Check service details
kubectl describe svc backend -n smart-parking

# Verify GCP quotas
gcloud compute project-info describe --project=YOUR_PROJECT_ID

# Common causes:
# - Insufficient quota for external IPs
# - LoadBalancer not enabled in region
# - Billing not enabled
```

#### Issue: Image Pull Errors
**Symptoms:** Pod fails with ImagePullBackOff
```powershell
# Verify images exist in GCR
gcloud container images list --repository=gcr.io/YOUR_PROJECT_ID

# Re-authenticate Docker
gcloud auth configure-docker

# Check image name in deployment
kubectl get deployment backend -n smart-parking -o yaml | Select-String "image:"
```

#### Issue: Database Connection Errors
**Symptoms:** Backend logs show "could not connect to server"
```powershell
# Check PostgreSQL is running
kubectl get pods -n smart-parking -l app=postgres

# Check PostgreSQL logs
kubectl logs -n smart-parking -l app=postgres

# Verify database service
kubectl get svc postgres -n smart-parking

# Test connection from backend pod
kubectl exec deployment/backend -n smart-parking -- nc -zv postgres 5432
```

#### Issue: CORS Errors in Browser
**Symptoms:** Browser console shows CORS policy errors
```powershell
# Check current CORS configuration
kubectl get configmap backend-config -n smart-parking -o yaml

# Verify frontend IP is in CORS_ALLOWED_ORIGINS
# Update backend-config.yaml and reapply:
kubectl apply -f k8s-gke/backend-config.yaml
kubectl rollout restart deployment/backend -n smart-parking
```

#### Issue: Frontend Shows API Connection Error
**Symptoms:** Frontend can't reach backend API
```powershell
# Verify backend is running
kubectl get pods -n smart-parking -l app=backend

# Check backend service has external IP
kubectl get svc backend -n smart-parking

# Test backend API directly
$BACKEND_IP = kubectl get svc backend -n smart-parking -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
Invoke-WebRequest -Uri "http://${BACKEND_IP}:8000/" -UseBasicParsing

# Frontend environment variables are baked at build time
# If backend IP changed, rebuild and redeploy frontend
```

#### Issue: Out of Memory (OOMKilled)
**Symptoms:** Pod terminated with reason "OOMKilled"
```powershell
# Check resource limits
kubectl describe pod <pod-name> -n smart-parking

# Increase memory limits in deployment YAML
# Edit backend.yaml, predict.yaml, or frontend.yaml
# Update resources.limits.memory value
kubectl apply -f k8s-gke/<service>.yaml
```

## Support

For issues specific to GKE deployment, consult:
- [GKE Documentation](https://cloud.google.com/kubernetes-engine/docs)
- [GCP Status Dashboard](https://status.cloud.google.com/)
