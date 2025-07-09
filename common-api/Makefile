up:
	docker compose -f docker-compose.dev.yml up -d --build

down:
	docker compose -f docker-compose.dev.yml down

logs:
	docker compose -f docker-compose.dev.yml logs -f

db-init:
	docker compose exec db psql -U postgres -f /docker-entrypoint-initdb.d/init.sql

up-prod:
	docker compose up -d --build

down-prod:
	docker compose down

logs-prod:
	docker compose logs -f

db-init-prod:
	docker compose exec db psql -U postgres -f /docker-entrypoint-initdb.d/init.sql

webhook-facebook-post-%:
	docker compose exec app curl -X POST http://localhost:8000/api/v1/webhooks/facebook-posts \
	  -H "Content-Type: application/json" \
	  -d '{"event": "seeded_event", "id": "$*"}'

webhook-facebook-inbox-%:
	docker compose exec app curl -X POST http://localhost:8000/api/v1/webhooks/facebook-inboxes \
	  -H "Content-Type: application/json" \
	  -d '{"event": "seeded_event", "id": "$*"}'
	  
webhook-facebook-comment-%:
	docker compose exec app curl -X POST http://localhost:8000/api/v1/webhooks/facebook-comments \
	  -H "Content-Type: application/json" \
	  -d '{"event": "seeded_event", "id": "$*"}'

create-admin:
	docker compose exec app python scripts/create_admin.py

seed-users:
	docker compose exec app python app/seeds/seed_users.py

seed-facebook-profiles:
	docker compose exec app python app/seeds/seed_facebook_profiles.py

seed-facebook-posts:
	docker compose exec app python app/seeds/seed_facebook_posts.py

seed-facebook-inboxes:
	docker compose exec app python app/seeds/seed_facebook_inboxes.py

seed-facebook-comments:
	docker compose exec app python app/seeds/seed_facebook_comments.py

seed-all: seed-users seed-facebook-profiles seed-facebook-posts seed-facebook-inboxes seed-facebook-comments 