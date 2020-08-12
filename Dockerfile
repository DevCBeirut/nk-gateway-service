# Use an official ubuntu runtime as a parent image
FROM node:14.7.0-alpine3.12

# Set the working directory to /app
WORKDIR /app
# Copy the current directory contents into the container at /app
ADD . /app

# Install any needed packages
RUN npm install

# Add the environment variables
ENV JWT_SECRET=mydirtylittlesecret

ENV REDIS_HOST=redis
ENV REDIS_PORT=6379

ENV BACKEND_HOST=backend
ENV BACKEND_PORT=1337

ENV REQUEST_MAX_ATTEMPTS=2

# Specify the run command
CMD ["node", "/app/app.js"]