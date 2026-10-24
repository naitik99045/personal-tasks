@echo off
echo Building and opening ChronoTask in Android Studio...
call npm.cmd run build
call npx.cmd cap sync android
call npx.cmd cap open android
pause
