FROM node:18 as build-stage
WORKDIR /app
COPY ./package.json ./yarn.lock tsconfig.json /app/
RUN yarn install --frozen-lockfile
COPY ./src  /app/src/
COPY ./public /app/public/
RUN yarn run build

FROM nginx:1.25
COPY --from=build-stage /app/build/ /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf