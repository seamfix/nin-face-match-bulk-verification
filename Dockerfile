# Use the official Node.js image as the base image
#FROM node:18-alpine
FROM public.ecr.aws/x7j6c7i4/biosmart-ximages/node18-alpine

# Create and set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the NestJS application
RUN npm run build

# Expose the application port
EXPOSE 8080

# Set the command to run the application
CMD ["node", "dist/main"]
