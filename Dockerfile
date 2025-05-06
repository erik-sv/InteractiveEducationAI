# Stage 1: Build the application
FROM node:18 AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
# Using --legacy-peer-deps might help with potential peer dependency issues
# If the install still fails here, we might need to investigate specific package issues
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Stage 2: Production environment
FROM node:18-alpine

WORKDIR /app

# Copy built assets from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/app/ai_instructions ./ai_instructions
COPY --from=builder /app/app/data ./data
COPY --from=builder /app/app/user_instructions ./user_instructions

# Ensure /app/transcriptions exists for persistent storage (Railway volume mount)
RUN mkdir -p /app/transcriptions

# Install Nginx in the production image
RUN apk add --no-cache nginx

# Copy nginx config
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

# Copy start.sh
COPY ./start.sh /start.sh
RUN chmod +x /start.sh

# Expose port 8080 for Railway
EXPOSE 8080

# Use start.sh as entrypoint
CMD ["/start.sh"]
