FROM node:10-jessie as dist

ARG COMPILER_PARAM=""
ENV COMPILER_PARAM=$COMPILER_PARAM

RUN apt update && \ 
    apt -y install git apt-transport-https openjdk-7-jdk && \
    echo "deb https://dl.bintray.com/sbt/debian /" | tee -a /etc/apt/sources.list.d/sbt.list && \
    apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 2EE0EA64E40A89B84B2DF73499E82A75642AC823 && \
    apt-get update && \
    apt-get install sbt
COPY . /
RUN sh /scripts/build.sh

FROM nginx:latest

#COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx-ide.conf /etc/nginx/conf.d/
COPY --from=dist /dist /usr/share/nginx/dist
RUN nginx -t
