FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . ./
RUN npm run build

FROM nginx:alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
# if trying to push to azure, comment out docker and activate azure and if trying to use
# local docker, comment out azure and activate docker
COPY nginx.conf /etc/nginx/conf.d/default.conf

# uncomment these two for azure version of FLYTE to work and comment out the above COPY for Azure to work!
#COPY nginx.azure.conf /etc/nginx/conf.d/default.conf
#COPY start-nginx.sh /start-nginx.sh

EXPOSE 8080
# CMD ["/start-nginx.sh"]
CMD ["nginx", "-g", "daemon off;"]