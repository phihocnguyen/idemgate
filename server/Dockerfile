# syntax=docker/dockerfile:1
# From monorepo root:
#   docker build -f server/Dockerfile -t idemgate-server .

FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /workspace
COPY mvnw pom.xml ./
COPY .mvn .mvn
COPY server server
COPY client client
COPY spring-boot-starter spring-boot-starter
COPY samples samples
RUN chmod +x mvnw && ./mvnw -q -pl server -am -DskipTests package

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S idemgate && adduser -S idemgate -G idemgate
COPY --from=build /workspace/server/target/idemgate-server-*.jar /app/app.jar
USER idemgate
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
