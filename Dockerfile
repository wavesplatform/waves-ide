FROM node:22 AS dist

ARG COMPILER_PARAM=""
ENV COMPILER_PARAM=$COMPILER_PARAM

WORKDIR /
COPY . /
RUN sh /scripts/build.sh

FROM nginx:latest

COPY nginx-ide.conf /etc/nginx/conf.d/
COPY --from=dist /dist /usr/share/nginx/dist
RUN nginx -t
