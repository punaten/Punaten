# # base node image
FROM node:18-bullseye-slim as base

# # Build the dev image
FROM base as build
RUN mkdir /app/
WORKDIR /app/
COPY . /app
RUN npm install
RUN npm run build

# # Get the production modules
FROM base as production-deps
RUN mkdir /app/
WORKDIR /app/
COPY --from=build /app/node_modules /app/node_modules
ADD package.json package-lock.json /app/
RUN npm prune --production

# Pull out the build files and do a production install
FROM base
ENV NODE_ENV=production
RUN mkdir /app/
WORKDIR /app/
ADD package.json package-lock.json /app/
COPY --from=build /app/public /app/public
# COPY --from=build /app/server /app/server
COPY --from=production-deps /app/node_modules /app/node_modules
CMD ["node", "public/server/index.js"]