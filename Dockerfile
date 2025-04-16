# Stage 1: Build the React application
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the application using a lightweight web server
FROM node:18-alpine

WORKDIR /app

# Install a simple static server
RUN npm install -g serve

# Copy the build output from the build stage
COPY --from=build /app/dist ./dist

# Expose the port the app runs on (default for serve is 3000)
EXPOSE 3000

# Command to serve the build directory
CMD ["serve", "-s", "dist", "-l", "3000"] 