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

let tempReleaseDir = "temp/release"

// Read additional information from the release notes document
let releaseNotesData =
    File.ReadAllLines "RELEASE_NOTES.md"
    |> parseAllReleaseNotes

let release = List.head releaseNotesData
let msg = release.Notes |> List.fold (fun r s -> r + s + "\n") ""

Target "ReleaseGenerator" (fun _ ->
    StageAll ""
    Git.Commit.Commit "" ((sprintf "Release %s\n" release.NugetVersion) + msg )
    Branches.push ""
)


Target "ReleaseTemplates" (fun _ ->
    CleanDir tempReleaseDir
    Repository.cloneSingleBranch "" (gitHome + "/" + gitName + ".git") "templates" tempReleaseDir

    let cleanEverythingFromLastCheckout() =
        let tempGitDir = Path.GetTempPath() </> "gitrelease"
        CleanDir tempGitDir
        CopyRecursive (tempReleaseDir </> ".git") tempGitDir true |> ignore
        CleanDir tempReleaseDir
        CopyRecursive tempGitDir (tempReleaseDir  </> ".git") true |> ignore

    cleanEverythingFromLastCheckout()
    CopyRecursive "templates" tempReleaseDir true |> tracefn "%A"

    StageAll tempReleaseDir

    Git.Commit.Commit tempReleaseDir ((sprintf "Release %s\n" release.NugetVersion) + msg )
    Branches.pushBranch tempReleaseDir "origin" "templates"
)

// --------------------------------------------------------------------------------------
// Run generator by default. Invoke 'build <Target>' to override
// --------------------------------------------------------------------------------------

Target "Default" DoNothing

RunTargetOrDefault "Default"
