FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Build step is skipped here for local dev (docker-compose overrides CMD with `npm run dev`).
# For production builds use: docker build --build-arg BUILD=true
CMD ["npm", "run", "dev"]
