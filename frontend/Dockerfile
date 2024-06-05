# Stage 1: Build the Angular application
FROM node:latest AS build
WORKDIR app
COPY frontend/. .
RUN npm install
COPY frontend/. .
RUN npm run build


# Stage 2: Serve the Angular application with Nginx
FROM nginx:latest
COPY --from=build /app/dist/frontend /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
