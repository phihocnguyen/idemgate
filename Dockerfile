# syntax=docker/dockerfile:1

FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /workspace
COPY mvnw pom.xml ./
COPY .mvn .mvn
COPY src src
RUN chmod +x mvnw && ./mvnw -q -DskipTests package

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S idemgate && adduser -S idemgate -G idemgate
COPY --from=build /workspace/target/idemgate-*.jar /app/app.jar
USER idemgate
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
