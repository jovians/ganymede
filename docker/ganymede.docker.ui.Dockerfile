FROM nginx:1.17.1-alpine
COPY src/app/ganymede/docker/ganymede.docker.ui.nginx.conf /etc/nginx/nginx.conf
COPY dist/export /usr/share/nginx/html