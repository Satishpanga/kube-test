
# Kube Test

Repository: [satishpanga/kube-test](https://github.com/satishpanga/kube-test)  
Files analyzed: 23  

This repository contains a full-stack React + Node.js application with Docker and Kubernetes deployment manifests.

---

## 📁 Directory Structure

```

satishpanga-kube-test/
├── README.md
├── docker-compose.yaml
├── backend/
│   ├── db.json
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── Dockerfile
│   ├── index.html
│   ├── nginx.conf
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── api.js
│       ├── App.jsx
│       ├── main.jsx
│       ├── styles.css
│       └── components/
│           ├── TodoForm.jsx
│           └── TodoItem.jsx
└── k8s/
├── backend-deployment.yaml
├── backend-service.yaml
├── frontend-deployment.yaml
├── frontend-service.yaml
├── ingress.yaml
└── namespace.yaml

````

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Satishpanga/react.git
cd react
````

---

### 2. Log in to Docker Hub

```bash
docker login
```

Enter your Docker Hub username and password when prompted.

---

### 3. Build Docker Images

#### a. Frontend

```bash
cd frontend
docker build -t pangasathish/rt-f:latest .
```

#### b. Backend

```bash
cd ../backend
docker build -t pangasathish/rt-b:latest .
```

---

### 4. Push Images to Docker Hub

```bash
docker push pangasathish/rt-f:latest
docker push pangasathish/rt-b:latest
```

Verify both images on [Docker Hub](https://hub.docker.com/repositories/pangasathish).

---

## 🐳 Running with Docker

### 1. Start Backend Container

```bash
docker run -d --name backend -p 5000:5000 pangasathish/rt-b:latest
```

### 2. Start Frontend Container

```bash
docker run -d --name frontend -p 3000:3000 pangasathish/rt-f:latest
```

### 3. Connect Frontend and Backend

```bash
docker network create myapp-network

docker run -d --name backend --network myapp-network -p 5000:5000 pangasathish/rt-b:latest
docker run -d --name frontend --network myapp-network -p 3000:3000 pangasathish/rt-f:latest
```

Use `http://backend:5000` in frontend API calls.

### 4. Access the App

* Frontend: `http://localhost:3000`
* Backend: `http://localhost:5000`

### 5. Cleanup

```bash
docker stop frontend backend
docker rm frontend backend
docker rmi pangasathish/rt-f:latest pangasathish/rt-b:latest
docker system prune -a
```

---

## ☸️ Kubernetes Deployment

### 1. Change to the k8s Directory

```bash
cd satishpanga-kube-test/k8s
```

### 2. Create Namespace

```bash
kubectl apply -f namespace.yaml
kubectl get namespaces
```

### 3. Deploy Backend

```bash
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml
kubectl get pods -n <namespace>
kubectl get svc -n <namespace>
```

### 4. Deploy Frontend

```bash
kubectl apply -f frontend-deployment.yaml
kubectl apply -f frontend-service.yaml
kubectl get pods -n <namespace>
kubectl get svc -n <namespace>
```

### 5. Deploy Ingress

```bash
kubectl apply -f ingress.yaml
kubectl get ingress -n <namespace>
kubectl describe ingress <ingress-name> -n <namespace>
```

### 6. Verify Application

* Backend:

```bash
kubectl port-forward svc/<backend-service-name> 5000:5000 -n <namespace>
```

* Frontend: Open via ingress hostname or NodePort.

### 7. Optional Cleanup

```bash
kubectl delete -f .
```

---

## 📌 Notes

* Ensure each folder (`frontend` and `backend`) has a valid `Dockerfile`.
* Adjust ports and tags as needed.
* Frontend communicates with backend via Docker network or Kubernetes service.

---

This `README.md` provides a clear path from local Docker setup to full Kubernetes deployment.

```
