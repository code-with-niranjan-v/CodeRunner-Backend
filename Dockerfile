# Use the official Node.js image
FROM node:16

# Install OpenJDK (Java)
RUN apt-get update && apt-get install -y openjdk-11-jdk

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json first (for caching dependencies)
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port your app will run on
EXPOSE 4000

# Command to run your Node.js app
CMD ["node", "main.js"]
