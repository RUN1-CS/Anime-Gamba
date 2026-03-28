# PHP && Apache image
FROM php:8.2-apache

# Set working directory
WORKDIR /var/www/html

# Install system dependencies first
RUN apt-get update && apt-get install -y libpq-dev && rm -rf /var/lib/apt/lists/*

# Enable required Apache modules BEFORE copying vhost
RUN a2enmod rewrite headers proxy proxy_http

# Set global ServerName to suppress AH00558 warning
RUN echo "ServerName localhost" > /etc/apache2/conf-available/servername.conf \
	&& a2enconf servername

# Copy Apache vhost configuration AFTER enabling modules
COPY ./vhost.conf /etc/apache2/sites-enabled/000-default.conf
RUN a2ensite 000-default.conf

# Expose port 80
EXPOSE 80

# Start Apache in foreground
CMD ["apache2-foreground"]
