FROM python:3.11-slim

# Install required dependencies, including Redis
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    redis-server \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Expose port
EXPOSE 8080

# Start both Redis and Django server
CMD ["sh", "-c", "redis-server --daemonize yes && python manage.py makemigrations &&python manage.py migrate && python manage.py runserver 0.0.0.0:8080"]
