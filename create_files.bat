@echo off

REM Create main directory
mkdir refactored_project
cd refactored_project

REM Create JavaScript files
type nul > app.js
type nul > ApiClient.js
type nul > utils.js
type nul > DraftManager.js
type nul > UiManager.js
type nul > ImageUploader.js

REM Create HTML file
type nul > index.html

REM Create CSS file
type nul > styles.css

REM Create a directory for any additional modules or components
mkdir modules

REM Output success message
echo Project structure created successfully!

REM List the created files and directories
echo Created files and directories:
dir /s /b