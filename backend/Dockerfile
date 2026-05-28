FROM node:20-alpine

WORKDIR /app

# نسخ package.json
COPY package.json ./

# تثبيت المكتبات (npm install ينشئ lock file إذا لم يكن موجوداً)
RUN npm install

# نسخ بقية الملفات
COPY . .

# بناء TypeScript
RUN npm run build

# Expose port
EXPOSE 4000

# تشغيل السيرفر
CMD ["node", "dist/server.js"]
