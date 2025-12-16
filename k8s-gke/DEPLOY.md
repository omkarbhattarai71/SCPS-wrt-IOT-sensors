# Step-by-Step GKE Deployment Guide for Smart Parking System

## Prerequisites Checklist
- ✅ Google Cloud SDK installed
- ✅ Docker Desktop running
- ✅ GCP account with billing enabled
- ✅ kubectl installed

## Step 1: GCP Project Setup

```powershell
# Login to Google Cloud
gcloud auth login

# List your projects to find your project ID
gcloud projects list

# Set your project (replace with your actual project ID)
$PROJECT_ID = "your-project-id-here"
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable container.googleapis.com
gcloud services enable compute.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

## Step 2: Create GKE Cluster

```powershell
# Set your region (replace with your actual region, e.g., europe-west1)
$REGION = "europe-west1"

# Create the cluster (takes 5-10 minutes)
gcloud container clusters create smart-parking-cluster `
  --region $REGION `
  --num-nodes 3 `
  --machine-type e2-standard-2 `
  --disk-size 30 `
  --enable-autoscaling --min-nodes 2 --max-nodes 5 `
  --enable-autorepair `
  --enable-autoupgrade

# Get cluster credentials
gcloud container clusters get-credentials smart-parking-cluster --region $REGION

# Verify connection
kubectl cluster-info
kubectl get nodes
```

## Step 3: Build and Push Docker Images to GCR

```powershell
# Configure Docker to authenticate with GCR
gcloud auth configure-docker

# Navigate to your project root
cd C:\repos\SCPS-wrt-IOT-sensors

# Build backend image
docker build -t gcr.io/$PROJECT_ID/smart-parking-backend:latest -f backend/Dockerfile backend

# Build predict image (from backend directory as context)
docker build -t gcr.io/$PROJECT_ID/smart-parking-predict:latest -f backend/prediction_service/Dockerfile backend

# Push images to GCR (this may take several minutes)
docker push gcr.io/$PROJECT_ID/smart-parking-backend:latest
docker push gcr.io/$PROJECT_ID/smart-parking-predict:latest
```

## Step 4: Update Kubernetes Manifests

```powershell
# Replace YOUR_PROJECT_ID with your actual project ID in all YAML files
Get-ChildItem k8s-gke\*.yaml | ForEach-Object {
  (Get-Content $_.FullName) -replace 'YOUR_PROJECT_ID', $PROJECT_ID | Set-Content $_.FullName
}

# Verify the replacement worked
Select-String -Path k8s-gke\*.yaml -Pattern "gcr.io"
```

## Step 5: Deploy Database and Backend Services

```powershell
# Create namespace
kubectl apply -f k8s-gke/namespace.yaml

# Deploy PostgreSQL
kubectl apply -f k8s-gke/postgres.yaml

# Wait for PostgreSQL to be ready (takes ~1-2 minutes)
kubectl wait --for=condition=ready pod -l app=postgres -n smart-parking --timeout=300s

# Deploy backend configuration
kubectl apply -f k8s-gke/backend-config.yaml

# Deploy backend
kubectl apply -f k8s-gke/backend.yaml

# Deploy prediction service
kubectl apply -f k8s-gke/predict.yaml

# Check pod status
kubectl get pods -n smart-parking
```

## Step 6: Get Backend External IP

```powershell
# Wait for backend LoadBalancer to get external IP (takes 2-3 minutes)
kubectl get svc backend -n smart-parking --watch
# Press Ctrl+C when you see an EXTERNAL-IP

# Get the backend IP
$BACKEND_IP = kubectl get svc backend -n smart-parking -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
Write-Host "Backend External IP: $BACKEND_IP"

# Test backend is accessible
Start-Sleep -Seconds 30
Invoke-WebRequest -Uri "http://${BACKEND_IP}:8000/" -UseBasicParsing
```

## Step 7: Update CORS and Rebuild Frontend

```powershell
# Update backend-config.yaml with backend IP
$configPath = "k8s-gke/backend-config.yaml"
$config = Get-Content $configPath -Raw
$config = $config -replace 'HOST_URL: "http://BACKEND_EXTERNAL_IP:8000"', "HOST_URL: `"http://${BACKEND_IP}:8000`""
$config = $config -replace 'CORS_ALLOWED_ORIGINS: "http://FRONTEND_EXTERNAL_IP,https://yourdomain.com"', 'CORS_ALLOWED_ORIGINS: "http://FRONTEND_EXTERNAL_IP,http://localhost"'
Set-Content -Path $configPath -Value $config

# Reapply backend config
kubectl apply -f k8s-gke/backend-config.yaml
kubectl rollout restart deployment/backend -n smart-parking

# Build frontend with the backend IP
docker build -t gcr.io/$PROJECT_ID/smart-parking-frontend:latest `
  --build-arg REACT_APP_API_URL="http://${BACKEND_IP}:8000" `
  --build-arg REACT_APP_FIREBASE_API_KEY="AIzaSyCDkSv4pG9fePIY7zkHPcTwMF1DhoB2ADM" `
  --build-arg REACT_APP_FIREBASE_AUTH_DOMAIN="smart-city-parking-63aac.firebaseapp.com" `
  --build-arg REACT_APP_FIREBASE_PROJECT_ID="smart-city-parking-63aac" `
  --build-arg REACT_APP_FIREBASE_STORAGE_BUCKET="smart-city-parking-63aac.firebasestorage.app" `
  --build-arg REACT_APP_FIREBASE_MESSAGING_SENDER_ID="643685116547" `
  --build-arg REACT_APP_FIREBASE_APP_ID="1:643685116547:web:eb7c7c8be5838e0e83af6f" `
  smartparking

# Push frontend image
docker push gcr.io/$PROJECT_ID/smart-parking-frontend:latest
```

## Step 8: Deploy Frontend

```powershell
# Update frontend.yaml with backend IP
$frontendPath = "k8s-gke/frontend.yaml"
$frontend = Get-Content $frontendPath -Raw
$frontend = $frontend -replace 'REACT_APP_API_URL: "http://BACKEND_EXTERNAL_IP:8000"', "REACT_APP_API_URL: `"http://${BACKEND_IP}:8000`""
Set-Content -Path $frontendPath -Value $frontend

# Deploy frontend
kubectl apply -f k8s-gke/frontend.yaml

# Wait for frontend LoadBalancer to get external IP
kubectl get svc frontend -n smart-parking --watch
# Press Ctrl+C when you see an EXTERNAL-IP

# Get the frontend IP
$FRONTEND_IP = kubectl get svc frontend -n smart-parking -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
Write-Host "Frontend External IP: $FRONTEND_IP"
```

## Step 9: Update CORS with Frontend IP

```powershell
# Update CORS to allow frontend IP
$config = Get-Content "k8s-gke/backend-config.yaml" -Raw
$config = $config -replace 'CORS_ALLOWED_ORIGINS: "http://FRONTEND_EXTERNAL_IP,http://localhost"', "CORS_ALLOWED_ORIGINS: `"http://${FRONTEND_IP},http://localhost`""
Set-Content -Path "k8s-gke/backend-config.yaml" -Value $config

# Apply updated config
kubectl apply -f k8s-gke/backend-config.yaml
kubectl rollout restart deployment/backend -n smart-parking

# Wait for backend to restart
Start-Sleep -Seconds 30
```

## Step 10: Create Django Superuser

```powershell
# Create superuser for admin access
kubectl exec -it deployment/backend -n smart-parking -- python manage.py createsuperuser
# Follow the prompts to create username, email, and password
```

## Step 11: Verify Deployment

```powershell
# Check all pods are running
kubectl get pods -n smart-parking

# Check all services
kubectl get svc -n smart-parking

# View deployment status
kubectl get deployments -n smart-parking

# Test backend API
Write-Host "Testing Backend API..."
Invoke-WebRequest -Uri "http://${BACKEND_IP}:8000/" -UseBasicParsing

# Test frontend
Write-Host "Testing Frontend..."
Invoke-WebRequest -Uri "http://${FRONTEND_IP}/" -UseBasicParsing

# Display access information
Write-Host "`n=== DEPLOYMENT COMPLETE ===`n"
Write-Host "Frontend URL: http://$FRONTEND_IP"
Write-Host "Backend API: http://${BACKEND_IP}:8000"
Write-Host "Django Admin: http://${BACKEND_IP}:8000/admin/"
Write-Host "`nOpen the frontend URL in your browser to access the application."
```

## Monitoring and Troubleshooting

```powershell
# View logs
kubectl logs -f deployment/backend -n smart-parking
kubectl logs -f deployment/predict -n smart-parking
kubectl logs -f deployment/frontend -n smart-parking

# Describe a pod for detailed info
kubectl describe pod <pod-name> -n smart-parking

# Execute commands inside a pod
kubectl exec -it deployment/backend -n smart-parking -- /bin/bash

# Get events
kubectl get events -n smart-parking --sort-by='.lastTimestamp'

# Check resource usage
kubectl top pods -n smart-parking
kubectl top nodes
```

## Cost Management

```powershell
# Scale down deployments when not in use
kubectl scale deployment/backend --replicas=1 -n smart-parking
kubectl scale deployment/predict --replicas=1 -n smart-parking
kubectl scale deployment/frontend --replicas=1 -n smart-parking

# Scale back up
kubectl scale deployment/backend --replicas=2 -n smart-parking
kubectl scale deployment/predict --replicas=2 -n smart-parking
kubectl scale deployment/frontend --replicas=2 -n smart-parking

# Pause cluster (requires manual intervention in GCP Console)
# Or delete and recreate when needed
```

## Cleanup

```powershell
# Delete the entire namespace (removes all resources)
kubectl delete namespace smart-parking

# Delete the cluster
gcloud container clusters delete smart-parking-cluster --region $REGION

# Delete container images
gcloud container images delete gcr.io/$PROJECT_ID/smart-parking-backend:latest --quiet
gcloud container images delete gcr.io/$PROJECT_ID/smart-parking-predict:latest --quiet
gcloud container images delete gcr.io/$PROJECT_ID/smart-parking-frontend:latest --quiet
```

## Common Issues and Solutions

### Issue: LoadBalancer stuck in "Pending"
**Solution:** Check GCP quotas and ensure LoadBalancer service is enabled
```powershell
gcloud compute project-info describe --project=$PROJECT_ID
```

### Issue: Pods in CrashLoopBackOff
**Solution:** Check logs for errors
```powershell
kubectl logs <pod-name> -n smart-parking --previous
```

### Issue: Image pull errors
**Solution:** Verify images exist in GCR
```powershell
gcloud container images list --repository=gcr.io/$PROJECT_ID
```

### Issue: Database connection errors
**Solution:** Ensure PostgreSQL is ready before backend
```powershell
kubectl get pods -n smart-parking -l app=postgres
kubectl logs -n smart-parking -l app=postgres
```

### Issue: CORS errors in browser
**Solution:** Verify CORS configuration includes frontend IP
```powershell
kubectl get configmap backend-config -n smart-parking -o yaml
```

## Next Steps

1. **Set up a custom domain:** Point your domain to the frontend IP and update ALLOWED_HOSTS
2. **Enable HTTPS:** Use Google-managed SSL certificates
3. **Set up CI/CD:** Automate deployments with Cloud Build
4. **Configure monitoring:** Enable Cloud Monitoring and Logging
5. **Optimize costs:** Use Autopilot mode or preemptible nodes
6. **Backup database:** Set up regular PostgreSQL backups or migrate to Cloud SQL

## Support

If you encounter issues:
1. Check the logs: `kubectl logs -f deployment/<name> -n smart-parking`
2. Check pod status: `kubectl describe pod <pod-name> -n smart-parking`
3. Verify services: `kubectl get svc -n smart-parking`
4. Review GCP Console for billing alerts and quota limits
