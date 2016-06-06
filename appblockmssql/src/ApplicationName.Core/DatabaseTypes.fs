module DatabaseTypes
open FSharp.Data

[<Literal>]
let connectionStringForCompileTime = @"Data Source=(localdb)\MSSQLLocalDB;AttachDbFilename=" + __SOURCE_DIRECTORY__ + @"\tools\Database1.mdf;Integrated Security=True;Connect Timeout=10"

#if DEMO
type EmployeesQuery = SqlCommandProvider<"SELECT * FROM Employees", connectionStringForCompileTime>

let allEmployees = (new EmployeesQuery("RuntimeConnectionString")).Execute()
#endif

