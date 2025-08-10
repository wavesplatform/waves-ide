FROM node:15 as dist

ARG COMPILER_PARAM=""
ENV COMPILER_PARAM=$COMPILER_PARAM

RUN echo "deb http://archive.debian.org/debian stretch main" > /etc/apt/sources.list
RUN apt-get update && apt-get install -y git apt-transport-https software-properties-common
RUN apt-get update
RUN apt-get -y install openjdk-8-jre

RUN wget https://github.com/sbt/sbt/releases/download/v1.5.0/sbt-1.5.0.tgz
RUN tar xzvf sbt-1.5.0.tgz -C /usr/share/
RUN update-alternatives --install /usr/bin/sbt sbt /usr/share/sbt/bin/sbt 9999
#RUN apt-get -y install sbt openjdk-8-jre
#RUN RUN RUN, why not? :)

COPY . /
RUN sh /scripts/build.sh

FROM nginx:latest

COPY nginx-ide.conf /etc/nginx/conf.d/
COPY --from=dist /dist /usr/share/nginx/dist
RUN nginx -t