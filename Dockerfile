# BUILD FOR LOCAL DEVELOPMENT
FROM public.ecr.aws/docker/library/node:16-alpine AS development

# Create app directory
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
COPY --chown=node:node package*.json ./

# Install the Nest CLI globally
RUN npm install -g @nestjs/cli

# Install app dependencies using the `npm ci` command instead of `npm install`
# RUN npm ci
RUN npm cache clean --force && rm -rf node_modules && npm ci
# Bundle app source
COPY --chown=node:node . .

# Use the node user from the image (instead of the root user)
USER node

# ...

# BUILD FOR PRODUCTION
FROM public.ecr.aws/docker/library/node:16-alpine AS build

WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available) for production build
COPY --chown=node:node package*.json ./

# Check if the Nest CLI is already installed
RUN if ! command -v nest &> /dev/null; then \
    npm install -g @nestjs/cli; \
fi

# Install production dependencies (including @nestjs/config)
RUN npm ci --only=production

# Copy over the application code and node_modules from the development image
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules
COPY --chown=node:node . .

# Run the build command which creates the production bundle
RUN npm run build

# Set NODE_ENV environment variable
ENV NODE_ENV production

# ...

# PRODUCTION
FROM public.ecr.aws/docker/library/node:16-alpine AS production

# Copy the bundled code from the build stage to the production image
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

# Start the server using the production build
CMD [ "node", "dist/src/main.js" ]
