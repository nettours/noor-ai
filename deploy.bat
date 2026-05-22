@echo off
chcp 65001 > nul
title نور AI - أداة النشر التلقائي
color 0A

echo.
echo ══════════════════════════════════════════════════════
echo   🚀 أداة النشر التلقائية - نور AI
echo ══════════════════════════════════════════════════════
echo.
echo هذا السكريبت سيساعدك في نشر التطبيق على الإنترنت
echo.
pause

REM التحقق من Git
git --version > nul 2>&1
if errorlevel 1 (
    echo ❌ Git غير مثبت! حمّله من: https://git-scm.com/download/win
    pause
    exit /b 1
)

REM التحقق من Node
node --version > nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js غير مثبت! حمّله من: https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Git مثبّت
echo ✅ Node.js مثبّت
echo.
echo ──────────────────────────────────────────────────────
echo  المرحلة 1: تجهيز الـ Backend للنشر
echo ──────────────────────────────────────────────────────
echo.

cd backend
echo 📦 جاري تثبيت مكتبات Backend...
call npm install --silent
if errorlevel 1 (
    echo ❌ فشل تثبيت المكتبات
    pause
    exit /b 1
)

echo 🔨 جاري بناء Backend...
call npm run build
if errorlevel 1 (
    echo ⚠️ فشل البناء - سنحاول لاحقاً على Railway
)

cd ..

echo.
echo ──────────────────────────────────────────────────────
echo  المرحلة 2: تجهيز الـ Frontend للنشر
echo ──────────────────────────────────────────────────────
echo.

cd frontend
echo 📦 جاري تثبيت مكتبات Frontend...
call npm install --legacy-peer-deps --silent
if errorlevel 1 (
    echo ❌ فشل تثبيت المكتبات
    pause
    exit /b 1
)

echo 🔨 جاري اختبار البناء...
call npm run build
if errorlevel 1 (
    echo ⚠️ هناك أخطاء في البناء - أصلحها قبل النشر
    pause
)

cd ..

echo.
echo ──────────────────────────────────────────────────────
echo  المرحلة 3: رفع الكود إلى GitHub
echo ──────────────────────────────────────────────────────
echo.

if not exist .git (
    echo 🔧 جاري تهيئة Git...
    git init
    git branch -M main
)

set /p commitMsg=📝 اكتب وصف التحديث (مثل: تحسينات الواجهة): 
if "%commitMsg%"=="" set commitMsg=Update

git add .
git commit -m "%commitMsg%"

set /p hasRemote=هل أضفت remote من قبل؟ (y/n): 
if /i "%hasRemote%"=="n" (
    set /p repoUrl=📋 الصق رابط GitHub repository: 
    git remote add origin %repoUrl%
)

echo 🚀 جاري الرفع إلى GitHub...
git push -u origin main

echo.
echo ══════════════════════════════════════════════════════
echo   ✅ تم بنجاح!
echo ══════════════════════════════════════════════════════
echo.
echo ⏭️ الخطوات التالية:
echo.
echo 1. اذهب إلى: https://railway.app
echo    وانشر المجلد backend
echo.
echo 2. اذهب إلى: https://vercel.com
echo    وانشر المجلد frontend
echo.
echo 📚 الدليل الكامل في ملف: DEPLOYMENT_GUIDE.txt
echo.
pause
