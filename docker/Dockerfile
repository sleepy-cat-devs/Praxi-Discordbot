FROM node:22-alpine

WORKDIR /app
RUN apk add --no-cache git
RUN git clone https://github.com/sleepy-cat-devs/Praxi-Discordbot.git
RUN cp Praxi-Discordbot/package*.json .
RUN cp Praxi-Discordbot/tsconfig.json .
RUN cp -r Praxi-Discordbot/src/ .

RUN npm install
RUN npm run build
