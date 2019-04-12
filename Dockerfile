FROM node:10-alpine as dist

RUN apk update && apk add git
COPY . /
RUN sh /scripts/build.sh

FROM nginx:latest

#COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx-ide.conf /etc/nginx/conf.d/
COPY --from=dist /dist /usr/share/nginx/dist
RUN nginx -t