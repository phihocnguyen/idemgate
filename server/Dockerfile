# syntax=docker/dockerfile:1
# From monorepo root:
#   docker build -f server/Dockerfile -t idemgate-server .

FROM node:22-alpine AS web
WORKDIR /web
COPY web/package.json web/package-lock.json ./
RUN npm ci
COPY web/ ./
RUN npm run build

FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /workspace
COPY mvnw pom.xml ./
COPY .mvn .mvn
COPY server server
COPY idemgate-client idemgate-client
COPY idemgate-spring-boot-starter idemgate-spring-boot-starter
COPY samples samples
# Embed ops console into the jar
COPY --from=web /web/dist/ ./server/src/main/resources/static/ui/
RUN chmod +x mvnw && ./mvnw -q -pl server -am -DskipTests package

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S idemgate && adduser -S idemgate -G idemgate
COPY --from=build /workspace/server/target/idemgate-server-*.jar /app/app.jar
USER idemgate
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
