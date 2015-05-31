// --------------------------------------------------------------------------------------
// FAKE build script
// --------------------------------------------------------------------------------------

#I "packages/FAKE/tools"
#r "packages/FAKE/tools/FakeLib.dll"
open System
open System.IO
open Fake
open Fake.Git
open Fake.ProcessHelper
open Fake.ReleaseNotesHelper
open Fake.ZipHelper

// Git configuration (used for publishing documentation in gh-pages branch)
// The profile where the project is posted
let gitOwner = "Krzysztof-Cieslak"
let gitHome = "https://github.com/" + gitOwner

// The name of the project on GitHub
let gitName = "generator-fsharp"

let tempGeneratorDir = "temp/generator"
let tempTemplatesDir = "temp/templates"

// Read additional information from the release notes document
let releaseNotesData =
    File.ReadAllLines "RELEASE_NOTES.md"
    |> parseAllReleaseNotes

let release = List.head releaseNotesData
let msg = release.Notes |> List.fold (fun r s -> r + s + "\n") ""

let npm = @"C:\Program Files\nodejs\npm"

let cleanEverythingFromLastCheckout dir =
    let tempGitDir = Path.GetTempPath() </> "gitrelease"
    CleanDir tempGitDir
    CopyRecursive (dir </> ".git") tempGitDir true |> ignore
    CleanDir dir
    CopyRecursive tempGitDir (dir  </> ".git") true |> ignore

Target "PushDevelop" (fun _ ->
    StageAll ""
    Git.Commit.Commit "" ((sprintf "Release %s\n" release.NugetVersion) + msg )
    Branches.pushBranch "" "origin" "develop"
)

Target "ReleaseGenerator" (fun _ ->
    CleanDir tempGeneratorDir
    Repository.cloneSingleBranch "" (gitHome + "/" + gitName + ".git") "master" tempGeneratorDir
    cleanEverythingFromLastCheckout tempGeneratorDir
    CreateDir (tempGeneratorDir </> "app")
    CopyRecursive "app" (tempGeneratorDir </> "app")  true |> tracefn "%A"
    CopyFile tempGeneratorDir "LICENSE"
    CopyFile tempGeneratorDir "package.json"
    CopyFile tempGeneratorDir "README.md"
    CopyFile tempGeneratorDir ".gitignore"
     //TODO
    StageAll tempGeneratorDir
    Git.Commit.Commit tempGeneratorDir ((sprintf "Release %s\n" release.NugetVersion) + msg )
    Branches.pushBranch tempGeneratorDir "origin" "master"
)

Target "ReleaseTemplates" (fun _ ->
    CleanDir tempTemplatesDir
    Repository.cloneSingleBranch "" (gitHome + "/" + gitName + ".git") "templates" tempTemplatesDir
    cleanEverythingFromLastCheckout tempTemplatesDir
    CopyRecursive "templates" tempTemplatesDir true |> tracefn "%A"
    CopyFile tempTemplatesDir "README.md"
    CopyFile tempGeneratorDir "LICENSE"
    StageAll tempTemplatesDir
    Git.Commit.Commit tempTemplatesDir ((sprintf "Release %s\n" release.NugetVersion) + msg )
    Branches.pushBranch tempTemplatesDir "origin" "templates"
)

Target "Release" (fun _ ->
    let args = sprintf "publish \".\" --tag %s" release.NugetVersion
    let result =
        ExecProcess (fun info ->
            info.FileName <- npm
            info.WorkingDirectory <- tempGeneratorDir
            info.Arguments <- args) System.TimeSpan.MaxValue
    if result <> 0 then failwithf "Error during running npm with %s" args
)

// --------------------------------------------------------------------------------------
// Run generator by default. Invoke 'build <Target>' to override
// --------------------------------------------------------------------------------------

Target "Default" DoNothing

"PushDevelop"
 ==> "ReleaseTemplates"
 ==> "Release"

"PushDevelop"
 ==> "ReleaseGenerator"
 ==> "Release"

RunTargetOrDefault "Default"
