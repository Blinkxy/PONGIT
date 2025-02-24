# Use the official Nginx image
FROM nginx:alpine

# Install OpenSSL to generate SSL certificates
RUN apk add --no-cache openssl

# Generate SSL certificates inside the container
RUN mkdir -p /etc/ssl/certs /etc/ssl/private && \
    openssl req -x509 -nodes -days 365 -newkey rsa:4096 -keyout /etc/ssl/private/nginx.key -out /etc/ssl/certs/nginx.crt -subj "/C=MA/L=TETOUAN/O=1337/CN=aech-che.42.fr"

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy only the necessary static files to the Nginx serving directory
COPY index.html resetpassword.html /usr/share/nginx/html/
COPY assets/ /usr/share/nginx/html/assets/
COPY components/ /usr/share/nginx/html/components/
COPY scripts/ /usr/share/nginx/html/scripts/
COPY views/ /usr/share/nginx/html/views/

# Expose port 80 and 443 for HTTP and HTTPS
EXPOSE 80 443

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
