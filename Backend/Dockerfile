# --- Giai đoạn 1: Build file JAR bằng Maven ---
FROM maven:3.9-eclipse-temurin-17-alpine AS builder

WORKDIR /study-quiz/backend

# 1. Tận dụng cache thư viện
COPY pom.xml .
RUN mvn dependency:go-offline

# 2. Copy mã nguồn và đóng gói
COPY src ./src
RUN mvn clean package -DskipTests

# --- Giai đoạn 2: Chạy ứng dụng bằng JRE tối giản ---
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy từ đúng đường dẫn /study-quiz/backend của builder
COPY --from=builder /study-quiz/backend/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]