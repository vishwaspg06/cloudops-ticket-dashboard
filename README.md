\# CloudOps Ticket Dashboard



A full-stack incident and operations ticket management application built to demonstrate a practical DevOps workflow using \*\*React, Node.js, SQLite, Docker, GitHub Actions, GitHub Container Registry (GHCR), Trivy, Kubernetes, and kind\*\*.



The project implements automated CI, containerization, security scanning, image publishing, Kubernetes deployment, and service health verification.



\## Architecture



```text

Developer

&#x20;  |

&#x20;  | git push

&#x20;  v

GitHub Repository

&#x20;  |

&#x20;  v

GitHub Actions CI/CD

&#x20;  |

&#x20;  +--> Backend Validation

&#x20;  |      - npm ci

&#x20;  |      - Syntax validation

&#x20;  |      - Health check

&#x20;  |

&#x20;  +--> Frontend Build

&#x20;  |      - npm ci

&#x20;  |      - Vite production build

&#x20;  |

&#x20;  +--> Docker

&#x20;  |      - Backend image

&#x20;  |      - Frontend image

&#x20;  |      - Container health test

&#x20;  |

&#x20;  +--> Trivy Security Scan

&#x20;  |

&#x20;  +--> GitHub Container Registry

&#x20;  |      - cloudops-backend

&#x20;  |      - cloudops-frontend

&#x20;  |

&#x20;  v

kind Kubernetes Cluster

&#x20;  |

&#x20;  +--> Backend Deployment

&#x20;  |      +--> ClusterIP Service

&#x20;  |

&#x20;  +--> Frontend Deployment

&#x20;         +--> ClusterIP Service

&#x20;  |

&#x20;  v

Kubernetes Rollout + Service Health Verification

```



\## Tech Stack



| Area | Technology |

|---|---|

| Frontend | React, Vite |

| Backend | Node.js, Express |

| Database | SQLite |

| Version Control | Git, GitHub |

| CI/CD | GitHub Actions |

| Containers | Docker |

| Container Registry | GitHub Container Registry (GHCR) |

| Security | Trivy |

| Orchestration | Kubernetes |

| CI Kubernetes Cluster | kind |

| Web Server | Nginx |



\## Application Features



The CloudOps dashboard provides an incident/ticket workflow with:



\- Create incident tickets

\- View operational incidents

\- Assign High, Medium, or Low priority

\- Track Open and Resolved status

\- Resolve incidents

\- Delete incidents

\- Dashboard statistics for Total, Open, and Resolved tickets

\- Backend health endpoint for automated monitoring



\## REST API



| Method | Endpoint | Purpose |

|---|---|---|

| GET | `/` | Backend status |

| GET | `/health` | Health check |

| GET | `/api/tickets` | List tickets |

| POST | `/api/tickets` | Create ticket |

| PUT | `/api/tickets/:id` | Update ticket |

| DELETE | `/api/tickets/:id` | Delete ticket |



\## CI/CD Pipeline



The GitHub Actions workflow automatically runs for pushes and pull requests to `main`.



\### 1. Backend Validation



The pipeline installs backend dependencies and validates the Node.js application.



```text

npm ci

node --check server.js

```



The backend is started and tested through its `/health` endpoint.



\### 2. Frontend Build



Frontend dependencies are installed and Vite creates the production build.



```text

npm ci

npm run build

```



\### 3. Docker Build



Separate Docker images are created for the frontend and backend.



The frontend uses a multi-stage build:



```text

Node.js build stage

&#x20;       |

&#x20;       v

Vite production build

&#x20;       |

&#x20;       v

Nginx runtime image

```



The backend image runs the Node.js/Express API.



\### 4. Container Health Test



The backend Docker container is started inside the GitHub Actions runner and the pipeline verifies:



```text

GET /health

```



A failed health check causes the CI step to fail.



\### 5. Security Scanning



Trivy scans both Docker images for HIGH and CRITICAL vulnerabilities.



```text

cloudops-backend:ci

cloudops-frontend:ci

```



The current pipeline reports findings without using them as a blocking deployment gate.



\### 6. Container Registry



On pushes to `main`, successfully built images are published to GitHub Container Registry.



```text

ghcr.io/vishwaspg06/cloudops-backend

ghcr.io/vishwaspg06/cloudops-frontend

```



Images are tagged with:



```text

latest

<git-commit-sha>

```



This provides both a convenient latest image and a traceable immutable commit-specific version.



\### 7. Kubernetes Deployment Testing



GitHub Actions creates a temporary Kubernetes cluster using \*\*kind\*\*.



The pipeline:



```text

Creates kind cluster

&#x20;     |

Loads Docker images

&#x20;     |

Applies Kubernetes manifests

&#x20;     |

Waits for deployments

&#x20;     |

Checks pods and services

&#x20;     |

Tests application services

```



This allows Kubernetes testing without requiring a local Kubernetes cluster or a paid cloud Kubernetes environment.



\## Kubernetes Resources



The project contains:



```text

k8s/

├── backend-deployment.yml

├── backend-service.yml

├── frontend-deployment.yml

└── frontend-service.yml

```



Both services currently use `ClusterIP`.



The backend Deployment also includes a Kubernetes readiness probe using:



```text

/health

```



\## Project Structure



```text

CloudOps/

├── .github/

│   └── workflows/

│       └── ci.yml

│

├── backend/

│   ├── Dockerfile

│   ├── package.json

│   ├── package-lock.json

│   └── server.js

│

├── frontend/

│   ├── Dockerfile

│   ├── src/

│   ├── public/

│   ├── package.json

│   └── vite.config.js

│

├── k8s/

│   ├── backend-deployment.yml

│   ├── backend-service.yml

│   ├── frontend-deployment.yml

│   └── frontend-service.yml

│

├── .gitignore

└── README.md

```



\## Run Locally



\### Backend



```bash

cd backend

npm install

node server.js

```



Backend:



```text

http://localhost:5000

```



Health endpoint:



```text

http://localhost:5000/health

```



\### Frontend



Open another terminal:



```bash

cd frontend

npm install

npm run dev

```



Frontend:



```text

http://localhost:5173

```



\## CI/CD Troubleshooting Demonstrated



During implementation, several realistic CI/container issues were identified and resolved.



\### Docker Port Conflict



The first container test attempted to use host port `5000`, which was already occupied by the backend process running earlier in CI.



The container test was moved to:



```text

5001:5000

```



\### SQLite Native Dependency Issue



The backend container initially failed because the native SQLite module required an incompatible GLIBC version.



The Docker build was corrected to rebuild `sqlite3` from source inside the Linux container environment.



\### GitHub Actions Workflow Location



The workflow was initially placed under the frontend directory.



It was moved to the required repository-level location:



```text

.github/workflows/ci.yml

```



These troubleshooting scenarios demonstrate debugging across Git, CI/CD, Linux containers, networking, and native application dependencies.



\## Container Packages



The CI/CD pipeline publishes:



```text

cloudops-backend

cloudops-frontend

```



to GitHub Container Registry under the `vishwaspg06` account.



\## Current Deployment Scope



The Kubernetes environment is intentionally created temporarily inside GitHub Actions using kind.



This project therefore demonstrates the complete container and Kubernetes validation workflow without requiring a continuously running production cloud environment.



SQLite is used for demonstration and local application persistence. A production architecture could replace it with a persistent managed database and appropriate Kubernetes/cloud storage.



\## Future Improvements



Potential extensions include:



\- Persistent production database

\- Kubernetes Ingress

\- Helm charts

\- Terraform infrastructure provisioning

\- Cloud deployment

\- Prometheus and Grafana monitoring

\- Centralized logging

\- Deployment environments and approval gates

\- Blocking CI security policies



\## Author



\*\*Vishwas P G\*\*



AWS Certified Cloud Practitioner  

Junior DevOps / Cloud Engineer



GitHub: `vishwaspg06`

