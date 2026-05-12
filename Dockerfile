FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN yarn install
COPY . .
RUN yarn build --configuration=production

FROM nginx:alpine
COPY --from=build /app/dist/SYNCRA /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80