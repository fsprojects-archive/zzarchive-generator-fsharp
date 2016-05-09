DBME_CopyToFile  -f "..\DatabaseTables.xlsm" -m "CopyAllCreateTableIfNotExistsSQL" -o "..\Schema.sql"

echo use Database1 >temp.txt
echo GO >>temp.txt
type ..\Schema.sql >> temp.txt
move /y temp.txt ..\Schema.sql

rem @powershell -ExecutionPolicy Bypass -NoLogo -NonInteractive -NoProfile -WindowStyle Hidden createdb.ps1
@powershell -ExecutionPolicy Bypass ./createdb.ps1
