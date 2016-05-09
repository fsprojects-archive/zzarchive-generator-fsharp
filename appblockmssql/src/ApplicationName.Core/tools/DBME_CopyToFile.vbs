'------------------------------------------------------------------------------------------------
'
' Usage: DBME_CopyToFile  <--filename|-f ExcelFilename>
'                                   <--macroname|-m macroName > 
'                                   [--arguments|-a arg1[,arg2,arg3...]]
'                                   <--outputfilename|-t OutputFilename>
'                                   [--verbose|-v]
'                                   [--help|-?]
'
' Example 1: DBME_CopyToFile  -f "D:\DBModelExcel\DatabaseModeling_Template.xls" -m "CopyAllCreateTableIfNotExistsSQL" -o "D:\DBModelExcel\CreateTables.sql"
'------------------------------------------------------------------------------------------------

' Force explicit declaration of all variables.
Option Explicit

'On Error Resume Next

Dim oArgs, ArgNum
Dim sSourceFile
Dim sOutputFile
Dim sMacroName, aMacroArgs, bHasMacroArgs
bHasMacroArgs = false

Dim verbose

verbose = false
Set oArgs = WScript.Arguments
ArgNum = 0

While ArgNum < oArgs.Count

	Select Case LCase(oArgs(ArgNum))
		Case "--filename", "-f":
			ArgNum = ArgNum + 1
			sSourceFile=oArgs(ArgNum)
		Case "--macroname", "-m":
			ArgNum = ArgNum + 1
			sMacroName=oArgs(ArgNum)
		Case "--arguments","-a":
			ArgNum = ArgNum + 1
			aMacroArgs = oArgs(ArgNum)
            bHasMacroArgs = true
		Case "--outputfilename", "-o":
			ArgNum = ArgNum + 1
			sOutputFile=oArgs(ArgNum)
        Case "--verbose", "-v":
			verbose = true
        Case "--help","-?":
			Call DisplayUsage
		Case Else:
            WScript.Echo LCase(oArgs(ArgNum))
			Call DisplayUsage
	End Select	

	ArgNum = ArgNum + 1
Wend

'------------------------------------------------------------------------------------------------
Dim fso
Set fso = CreateObject("Scripting.FileSystemObject")
'-- Run macros
If bHasMacroArgs Then
    RunVbs "DBME_RunExcelMacro.vbs", "-f """ & fso.GetAbsolutePathName(sSourceFile) & """ -m """ & sMacroName & """ -a """ & aMacroArgs & """"
Else
    RunVbs "DBME_RunExcelMacro.vbs", "-f """ & fso.GetAbsolutePathName(sSourceFile) & """ -m """ & sMacroName
End if    
DisplayError "After Run macros"
'-- Save content from clipboard
CopyClipboardToFile fso.GetAbsolutePathName(sOutputFile)
DisplayError "End"
'------------------------------------------------------------------------------------------------

Sub RunExe(fileName, arguments)
    Dim WshShell, oExec
    Set WshShell = CreateObject("WScript.Shell")

    Set oExec = WshShell.Exec("""" & fileName & """ " & arguments)

    Do While oExec.Status = 0
        WScript.Sleep 100
    Loop
End Sub

Sub RunVbs(fileName, arguments)
    Dim WshShell
    Set WshShell = CreateObject("WScript.Shell")

    Call WshShell.Run(fileName & " " & arguments, 0, true)
End Sub

Sub CopyClipboardToFile(fileName)
    'Dim clip
    'Set clip = CreateObject("WshExtra.Clipboard")
    'strText = clip.Paste()

    Dim objHTML, strText
    Set objHTML = CreateObject("htmlfile")
    strText = objHTML.ParentWindow.ClipboardData.GetData("text")
    
    Dim fso, f
    Set fso = CreateObject("Scripting.FileSystemObject")
    Set f = fso.CreateTextFile(fileName)
    f.Write strText
    f.Close
End Sub

Sub Display(Msg)
    WScript.Echo Now & ". Error Code: " & Hex(Err) & " - " & Msg
End Sub

Sub DisplayError(Msg)
    If Err <> 0 Then
        WScript.Echo Now & ". Error Code: " & Hex(Err) _
                & Vblf & "Error: " & Err.Description _
                & Vblf & " - " & Msg
     End If
End Sub

Sub Trace(Msg)
	if verbose = true then
		WScript.Echo Now & " : " & Msg	
	end if
End Sub

Sub DisplayUsage
	WScript.Echo "Usage: DBME_CopyToFile <--filename|-f ExcelFilename> " _
        & Vblf & "                     <--macroname|-m macroName > " _
        & Vblf & "                     [--arguments|-a arg1[,arg2,arg3...]] " _
        & Vblf & "                     <--outputfilename|-t OutputFilename> " _
        & Vblf & "                     [--verbose|-v]" _
        & Vblf & "                     [--help|-?]" _
        & Vblf & "Example 1: DBME_CopyToFile  -f ""D:\DBModelExcel\DatabaseModeling_Template.xls"" -m ""CopyAllCreateNotExistTableSQL"" -o ""D:\DBModelExcel\CreateTables.sql"""
	WScript.Quit (1)
End Sub
