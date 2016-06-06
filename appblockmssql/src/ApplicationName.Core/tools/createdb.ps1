#this is the name that Fsharp.Data.SqlClient TypeProvider expects it to be at build time
$new_db_name = "Database1" 

$detach_db_sql = @"
use master;
GO
EXEC sp_detach_db @dbname = N'$new_db_name';
GO
"@

$detach_db_sql | Out-File "detachdb.sql"
sqlcmd -S "(localdb)\MSSQLLocalDB" -i detachdb.sql
Remove-Item .

Remove-Item "$new_db_name.mdf"
Remove-Item "$new_db_name.ldf"

$create_db_sql = @"
    USE master ;
    GO
    CREATE DATABASE $new_db_name
    ON 
    ( NAME = Sales_dat,
        FILENAME = '$PSScriptRoot\$new_db_name.mdf',
        SIZE = 10,
        MAXSIZE = 50,
        FILEGROWTH = 5 )
    LOG ON
    ( NAME = Sales_log,
        FILENAME = '$PSScriptRoot\$new_db_name.ldf',
        SIZE = 5MB,
        MAXSIZE = 25MB,
        FILEGROWTH = 5MB ) ;
    GO
"@

$create_db_sql | Out-File "createdb.sql"
sqlcmd -S "(localdb)\MSSQLLocalDB" -i createdb.sql
Remove-Item .

sqlcmd -S "(localdb)\MSSQLLocalDB" -i ..\schema.sql

$detach_db_sql | Out-File "detachdb.sql"
sqlcmd -S "(localdb)\MSSQLLocalDB" -i detachdb.sql
Remove-Item .
