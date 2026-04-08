# Use official Java image
FROM eclipse-temurin:21-jdk

# Set working directory
WORKDIR /app

# Copy project files
COPY . .

# Give permission to mvnw
RUN chmod +x mvnw

# Build the project
RUN ./mvnw clean install -DskipTests

# Expose port
EXPOSE 8080

# Run application
CMD ["sh", "-c", "java -jar target/*.jar"]
