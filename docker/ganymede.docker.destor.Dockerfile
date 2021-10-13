FROM gany-base-image:latest

WORKDIR /usr/destor_server

COPY ganymede.conf.json .
COPY src/app/ganymede/destor/package.json .
RUN npm install

COPY src/app/ganymede/destor/src/destor.entrypoint.js .

COPY src/app/ganymede/docker/ganymede.docker.destor.nginx.conf /etc/nginx/nginx.conf

COPY src/app/ganymede/destor/bootstrap.sh .
RUN touch is_docker_env
RUN chmod +x bootstrap.sh
CMD [ "sh", "bootstrap.sh" ]
