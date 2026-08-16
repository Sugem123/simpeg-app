FROM php:8.2-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    libxml2-dev \
    libpq-dev \
    oniguruma-dev \
    zip \
    unzip \
    bash \
    nginx \
    supervisor

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_pgsql pgsql mbstring exif pcntl bcmath gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy project
COPY . .

# Ensure dirs exist and are writable
RUN mkdir -p bootstrap/cache storage/logs storage/framework/cache storage/framework/sessions storage/framework/views storage/app/public \
    && chmod -R 775 bootstrap/cache storage

# Install dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Create storage symlink
RUN php artisan storage:link 2>/dev/null || ln -s /var/www/html/storage/app/public /var/www/html/public/storage

# Set permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Configure nginx
RUN mkdir -p /etc/nginx/http.d \
    && printf 'server {\n    listen 8000;\n    server_name _;\n    root /var/www/html/public;\n    index index.php;\n    client_max_body_size 50M;\n    location / {\n        try_files $uri $uri/ /index.php?$query_string;\n    }\n    location ~ \\.php$ {\n        fastcgi_pass 127.0.0.1:9000;\n        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;\n        include fastcgi_params;\n    }\n}\n' > /etc/nginx/http.d/default.conf

# Configure supervisor
RUN mkdir -p /etc/supervisor.d \
    && printf '[program:php-fpm]\ncommand=php-fpm\nautostart=true\nautorestart=true\n\n[program:nginx]\ncommand=nginx -g "daemon off;"\nautostart=true\nautorestart=true\n' > /etc/supervisor.d/simpeg.ini

EXPOSE 8000

CMD ["supervisord", "-n", "-c", "/etc/supervisord.conf"]
