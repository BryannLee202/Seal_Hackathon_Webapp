FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
RUN chmod +x mvnw && ./mvnw -B dependency:go-offline

COPY src src
RUN ./mvnw -B package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && addgroup --system spring && adduser --system --ingroup spring spring

COPY --from=build --chown=spring:spring /app/target/*.jar app.jar

USER spring:spring

EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=5s --start-period=40s --retries=5 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1
# -Djava.security.egd forces the JVM to use /dev/urandom (non-blocking) instead of
# /dev/random, which can hang for a long time on entropy-starved cloud containers.
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
