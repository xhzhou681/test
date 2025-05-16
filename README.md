# Docker Compose User Guide

## 1. Startup and Access
```bash
docker-compose up -d
```
Frontend access: http://localhost:8086  
Backend access: http://localhost:3066  
(Note: These ports are used mainly to avoid conflicts with existing ports on the host)

Admin account: (automatically generated when docker starts)
- username: admin
- password: admin123
  
MySQL account:
- root password: myrootpass
- database name: mydb
- table name: users
- JWT_SECRET: IwillChangeSecretkey

To build the frontend:
1. Navigate to the frontend directory
2. Execute: npm run build
(Compiled code is stored in the front\build directory)

To run the backend:
1. Execute: npm start
2. After execution, access via http://localhost:3066
3. Test: http://localhost:3066/api/ksmc
   If successful, it will return content like:
   ["Emergency Nursing Group*", "Surgery*", "Gynecology*", "Traditional Chinese Medicine*", ...]

Main Nginx configuration parameters:
```
listen 8086;
location / {
    root /usr/share/nginx/html;    #corresponds to the frontend/build directory
    ......
}
location /api {
    proxy_pass http://backend:3066/api;  #corresponds to http://localhost:3066/api
    ......
}
```

## 2. Service Dependency Order
1. MySQL completes health check (maximum wait time: 25 seconds)
2. Backend service starts and connects to the database
3. Frontend is built and Nginx starts

## 3. Data Persistence
- MySQL data storage location: `/var/lib/mysql`
- Verification method:
```bash
docker volume inspect zxh_mysql_data
```

## 4. Environment Variable Configuration
| Service | Key Variable        | Notes                                    |
|---------|---------------------|------------------------------------------|
| backend | MYSQL_HOST          | Must match the MySQL service name        |
| mysql   | MYSQL_ROOT_PASSWORD | Should use key management in production  |

## 5. Network Configuration
- Nginx routing rules:
  - `/api/*` proxies to the backend service (port 3000)
  - Frontend access address: http://localhost:8086
  - Static resource path: `/usr/share/nginx/html`

## 6. MySQL Connection Retry
The backend service has built-in retry mechanisms:
- Wait 2 seconds and retry after initial connection failure
- Maximum number of retries: 5
- Exponential backoff strategy (waiting time doubles each attempt)