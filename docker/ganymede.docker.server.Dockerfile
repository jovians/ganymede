FROM gany-base-image:latest

WORKDIR /usr/nodejs_server

COPY src/app/ganymede/server/install.deps.js .
COPY dist-server/dependencies.json /usr/nodejs_server/src/app/dependencies.json
COPY dist-server-deps/* ./src/app
RUN node install.deps.js

COPY dist-server/* /usr/nodejs_server/src/app

COPY ganymede.conf.json .
COPY ganymede.app.js .
COPY ganymede.app.interface.js .
COPY ganymede.app.server.js .

COPY dist-server/server.nginx.conf /etc/nginx/nginx.conf

COPY src/app/ganymede/server/bootstrap.sh .
RUN touch is_docker_env
RUN chmod +x bootstrap.sh
CMD [ "sh", "bootstrap.sh" ]
