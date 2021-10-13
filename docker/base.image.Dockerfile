FROM nginx:1.19.10-alpine

RUN apk add --update --no-cache nodejs npm curl py-pip nano \
    && apk add --no-cache --virtual native-deps g++ gcc libgcc libstdc++ linux-headers make python3 py3-pip
