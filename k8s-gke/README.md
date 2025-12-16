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

### 5. Deploy to GKE

```bash
# Apply manifests in order
kubectl apply -f k8s-gke/namespace.yaml
kubectl apply -f k8s-gke/postgres.yaml
kubectl apply -f k8s-gke/backend-config.yaml
kubectl apply -f k8s-gke/backend.yaml
kubectl apply -f k8s-gke/predict.yaml

# Wait for backend LoadBalancer to get external IP
kubectl get svc backend -n smart-parking --watch

# Note the EXTERNAL-IP of the backend service
BACKEND_IP=$(kubectl get svc backend -n smart-parking -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "Backend IP: $BACKEND_IP"

# Update backend-config.yaml and frontend.yaml with the backend IP
# Then rebuild frontend with the correct API URL
docker build -t gcr.io/YOUR_PROJECT_ID/smart-parking-frontend:latest \
  --build-arg REACT_APP_API_URL=http://$BACKEND_IP:8000 \
  --build-arg REACT_APP_FIREBASE_API_KEY=AIzaSyCDkSv4pG9fePIY7zkHPcTwMF1DhoB2ADM \
  --build-arg REACT_APP_FIREBASE_AUTH_DOMAIN=smart-city-parking-63aac.firebaseapp.com \
  --build-arg REACT_APP_FIREBASE_PROJECT_ID=smart-city-parking-63aac \
  --build-arg REACT_APP_FIREBASE_STORAGE_BUCKET=smart-city-parking-63aac.firebasestorage.app \
  --build-arg REACT_APP_FIREBASE_MESSAGING_SENDER_ID=643685116547 \
  --build-arg REACT_APP_FIREBASE_APP_ID=1:643685116547:web:eb7c7c8be5838e0e83af6f \
  smartparking

docker push gcr.io/YOUR_PROJECT_ID/smart-parking-frontend:latest

# Deploy frontend
kubectl apply -f k8s-gke/frontend.yaml

# Get frontend external IP
kubectl get svc frontend -n smart-parking --watch
```

### 6. Update CORS Configuration

```bash
# Get frontend external IP
FRONTEND_IP=$(kubectl get svc frontend -n smart-parking -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

# Update backend-config.yaml CORS_ALLOWED_ORIGINS with frontend IP
# Then reapply
kubectl apply -f k8s-gke/backend-config.yaml
kubectl rollout restart deployment/backend -n smart-parking
```

### 7. Create Django Superuser

```bash
kubectl exec -it deployment/backend -n smart-parking -- python manage.py createsuperuser
```

### 8. Access Your Application

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

### View logs
```bash
kubectl logs -f deployment/backend -n smart-parking
kubectl logs -f deployment/predict -n smart-parking
kubectl logs -f deployment/frontend -n smart-parking
```

### Check pod status
```bash
kubectl get pods -n smart-parking
kubectl describe pod POD_NAME -n smart-parking
```

### Check service status
```bash
kubectl get svc -n smart-parking
kubectl describe svc backend -n smart-parking
```

### Debug connectivity
```bash
kubectl exec -it deployment/backend -n smart-parking -- /bin/bash
```

## Support

For issues specific to GKE deployment, consult:
- [GKE Documentation](https://cloud.google.com/kubernetes-engine/docs)
- [GCP Status Dashboard](https://status.cloud.google.com/)
