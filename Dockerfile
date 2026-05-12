FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN yarn install
COPY . .
RUN node node_modules/@angular/cli/bin/ng.js build --configuration=production

FROM nginx:alpine
COPY --from=build /app/dist/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80