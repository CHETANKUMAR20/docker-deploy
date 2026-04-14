# =============================
# c01ai Blog - Docker Image
# =============================

FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy files
COPY . .

# Install Vercel CLI
RUN npm install -g serve

# Expose port
EXPOSE 3000

# Start app
CMD ["serve", "-s", ".", "-l", "3000"]