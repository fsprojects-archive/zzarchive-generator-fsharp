use Database1 
GO 
IF NOT EXISTS (
  SELECT *
    FROM INFORMATION_SCHEMA.TABLES
   WHERE TABLE_TYPE = 'BASE TABLE'
     AND TABLE_SCHEMA = 'dbo'
     AND TABLE_NAME = 'Departments'
  )
BEGIN
--  Create table 'Departments'
CREATE TABLE [Departments] (
   [DepartmentID] int IDENTITY (1,1) NOT NULL
  ,[DepartmentName] nvarchar(50) NOT NULL
  ,[ParentID] int NULL
  ,[ManagerID] int NULL
  ,CONSTRAINT PK_Departments PRIMARY KEY CLUSTERED (DepartmentID)
)
END
;

IF NOT EXISTS (
  SELECT *
    FROM INFORMATION_SCHEMA.TABLES
   WHERE TABLE_TYPE = 'BASE TABLE'
     AND TABLE_SCHEMA = 'dbo'
     AND TABLE_NAME = 'Employees'
  )
BEGIN
--  Create table 'Employees'
CREATE TABLE [Employees] (
   [EmployeeID] int IDENTITY (1,1) NOT NULL
  ,[LastName] nvarchar(50) NOT NULL
  ,[FirstName] nvarchar(50) NOT NULL
  ,[DepartmentID] int NOT NULL
  ,CONSTRAINT PK_Employees PRIMARY KEY NONCLUSTERED (EmployeeID)
)
CREATE CLUSTERED INDEX IK_Employees_FirstName_LastName ON [Employees] (FirstName, LastName)
CREATE INDEX IK_Employees_LastName ON [Employees] (LastName)
END
;


-- Foreign keys for table 'Departments'
ALTER TABLE [Departments] ADD
  CONSTRAINT FK_Departments_ParentID
  FOREIGN KEY (ParentID)
  REFERENCES Departments(DepartmentID)
, CONSTRAINT FK_Departments_ManagerID
  FOREIGN KEY (ManagerID)
  REFERENCES Employees(EmployeeID)
;

-- Foreign keys for table 'Employees'
ALTER TABLE [Employees] ADD
  CONSTRAINT FK_Employees_DepartmentID
  FOREIGN KEY (DepartmentID)
  REFERENCES Departments(DepartmentID)
;

