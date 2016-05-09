simple Application Block with Microsoft SQL Server (appblockmssql)
==================================================================

- class library `ApplicationName.Core` template for the core functionality
- `DatabaseTables.xlsm` to describe the database tables
- `Schema.sql` automatically generated on Windows before a build
- `DataTypes.fs` containts the types for the tables using [FSharp.Data.SqlClient](http://fsprojects.github.io/FSharp.Data.SqlClient/)
- NUnit tests in `ApplicationName.Core.Tests` run if command line `build` started
- `#if DEMO` for the parts to be deleted in the real application

@davidpodhola
