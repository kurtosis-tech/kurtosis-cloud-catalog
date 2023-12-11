FROM --platform=linux/amd64 node:alpine

WORKDIR /root/
#COPY ./app/build ./app/build
COPY ./api/build ./api/build
COPY ./api/node_modules ./api/node_modules

EXPOSE 8081

ENV NODE_ENV "production"
CMD ["node", "/root/api/build/index.js"]
