all:
	cd server && python3 -m venv venv && touch .env
	mkdir -p media
	cd media && mkdir -p images && mkdir -p logos && mkdir -p qr_codes
	


	docker compose up --build

up:
	docker compose up


build:
	docker compose up --build

down:
	docker compose -f down

prune:
	docker system prune

re: all down

clean:
	docker compose down --rmi all --volumes

.PHONY: all re down clean


