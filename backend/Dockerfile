# ---------- Build stage ----------
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom first for better layer caching
COPY pom.xml .
RUN mvn -q -e -DskipTests dependency:go-offline

# Copy sources and build
COPY /src ./src
RUN mvn -q -DskipTests clean package

# ---------- Runtime stage ----------
FROM eclipse-temurin:21-jre
WORKDIR /app

# Create non-root user
RUN useradd -ms /bin/bash appuser
USER appuser

# Copy fat jar
COPY --from=build /app/target/*.jar /app/app.jar

# Environment (override in runtime/compose)
ENV JAVA_OPTS="" \
    SPRING_PROFILES_ACTIVE=prod \
    SERVER_PORT=2022

EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
