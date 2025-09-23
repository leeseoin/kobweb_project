# Multi-stage build for Spring Boot
FROM openjdk:21-jdk-slim as build

WORKDIR /app

# Copy gradle files
COPY gradlew .
COPY gradle gradle/
COPY build.gradle .
COPY settings.gradle .

# Copy source code
COPY src src/

# Build application
RUN chmod +x ./gradlew
RUN ./gradlew build -x test

# Runtime stage
FROM openjdk:21-jre-slim

WORKDIR /app

# Copy built jar from build stage
COPY --from=build /app/build/libs/*.jar app.jar

# Create non-root user
RUN groupadd -r appgroup && useradd -r -g appgroup appuser
RUN chown -R appuser:appgroup /app
USER appuser

# Expose port
EXPOSE 8080

# Set JVM options
ENV JAVA_OPTS="-Xms512m -Xmx1024m -Dfile.encoding=UTF-8"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Run application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]