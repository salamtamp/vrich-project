# VRich Project

FastAPI application with PostgreSQL, Redis, and monitoring.

## Development Setup

1. **Clone and start**
   ```bash
   git clone <repository-url>
   cd vrich-project
   cp .env.example .env.dev
   docker compose -f docker-compose.dev.yml up -d
   ```

  # Run seeds only 
  docker compose -f docker-compose.dev.yml up seed

2. **Access**
   - API: http://localhost:8000
   - Docs: http://localhost:8000/docs
   - pgAdmin: http://localhost:5050 (admin@example.com / admin)

## Production Setup

1. **Configure environment**
   ```bash
   cp .env.example .env
   ```

2. **Edit .env file**

3. **Create directories**
   ```bash
   mkdir -p nginx/conf.d ssl monitoring scripts
   ```

4. **Deploy**
   ```bash
   # Basic
   docker compose up -d

   # Run seeds only
  docker compose up seed
   
   # Full stack
   docker compose --profile backup up -d
   ```

## SSL Setup (Production)

1. **Get SSL certificates**
   ```bash
   # Using Let's Encrypt
   certbot certonly --standalone -d yourdomain.com
   ```

2. **Copy certificates**
   ```bash
   cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/
   cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/
   ```

## Nginx Configuration

Create `nginx/nginx.conf`:
```nginx
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:8000;
    }

    server {
        listen 80;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name yourdomain.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        location / {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

## Access Points

- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health**: http://localhost:8000/health
- **Prometheus**: http://localhost:9090

## Seeding the Database

### Seeding Order (Important)
Run each script in this order to satisfy foreign key dependencies:

```bash
python app/seeds/seed_users.py
python app/seeds/seed_facebook_profiles.py
python app/seeds/seed_facebook_posts.py
python app/seeds/seed_facebook_inboxes.py
python app/seeds/seed_facebook_comments.py
```

- Each script is idempotent: running it multiple times will not create duplicate data.
- If you encounter constraint errors, ensure you have the correct allowed values for each field (see `app/seeds/constants.py`).
- If you need to reset, truncate the relevant tables in your database before seeding again.

### Troubleshooting
- If you see errors about database connection, check your `DATABASE_URL` in `.env` or config files.
- If you see constraint errors (e.g., for `type`, `media_type`, or `status`), check the allowed values in the schema and constants.
- For Docker users, make sure to run the seed scripts inside the container if your database hostname is not `localhost`.