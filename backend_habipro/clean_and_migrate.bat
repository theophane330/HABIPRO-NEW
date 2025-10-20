@echo off
echo ========================================
echo NETTOYAGE COMPLET ET MIGRATION
echo ========================================
echo.

echo [1/7] Suppression des migrations...
cd backend_app\migrations
del /Q *.py 2>nul
echo # Django migrations > __init__.py
cd ..\..
echo ✓ Migrations supprimees

echo.
echo [2/7] Suppression de la base de donnees...
if exist db.sqlite3 (
    del db.sqlite3
    echo ✓ Base de donnees supprimee
) else (
    echo ✓ Pas de base de donnees a supprimer
)

echo.
echo [3/7] Suppression des caches Python...
cd backend_app
for /d %%i in (__pycache__) do @rd /s /q "%%i" 2>nul
del /s /q *.pyc 2>nul
cd ..
cd backend_habipro
for /d %%i in (__pycache__) do @rd /s /q "%%i" 2>nul
del /s /q *.pyc 2>nul
cd ..
echo ✓ Caches supprimes

echo.
echo [4/7] Creation des migrations...
python manage.py makemigrations backend_app
if %errorlevel% neq 0 (
    echo ✗ ERREUR lors de la creation des migrations
    echo Verifiez que AUTH_USER_MODEL est dans settings.py
    pause
    exit /b 1
)
echo ✓ Migrations creees

echo.
echo [5/7] Application des migrations...
python manage.py migrate
if %errorlevel% neq 0 (
    echo ✗ ERREUR lors de l'application des migrations
    pause
    exit /b 1
)
echo ✓ Migrations appliquees

echo.
echo [6/7] Verification de la configuration...
python manage.py check
if %errorlevel% neq 0 (
    echo ✗ ERREUR de configuration
    pause
    exit /b 1
)
echo ✓ Configuration OK

echo.
echo [7/7] Creation du superutilisateur...
echo Vous allez creer un superutilisateur.
echo.
python manage.py createsuperuser

echo.
echo ========================================
echo ✓ TERMINE AVEC SUCCES !
echo ========================================
echo.
echo Vous pouvez maintenant lancer le serveur avec:
echo    python manage.py runserver
echo.
echo Puis acceder a l'admin sur:
echo    http://127.0.0.1:8000/admin/
echo.
pause