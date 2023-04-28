#===================================
# builder includes all to be able to build the application on a linux environment (builder)
#===================================
FROM node:18-alpine as builder
#development to have all dev dependencies installed
ENV NODE_ENV=development

WORKDIR /usr/src/server

# RUN apk add --no-cache git

COPY package*.json ./
RUN npm ci --socket-timeout 100000

COPY . .

RUN npm run build

#===================================
# finally build the application (stage-1)
#===================================
FROM node:18-alpine
LABEL maintainer="ict-uek"
# RUN apk add --no-cache curl

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --omit=dev --socket-timeout 100000

WORKDIR /usr/src/app/dist
COPY --from=builder /usr/src/server/dist .

ENV NODE_ENV=production

CMD ["npm", "run", "start:prod"]
