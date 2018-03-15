
FROM node:carbon

# Create app directory
WORKDIR /usr/src/app


COPY package*.json	./

RUN npm install

COPY	.	.

EXPOSE 5000
CMD ["npm", "run", "serve"]
