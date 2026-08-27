FROM node:24-alpine

WORKDIR /study-quiz/frontend

COPY package*.json .

RUN npm install

RUN npm install -g @babel/core @babel/cli

COPY . .

# RUN npm run build


CMD ["npm", "run", "dev"]

# docker build --tag frontend . 

