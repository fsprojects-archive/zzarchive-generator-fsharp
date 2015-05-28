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

Target "ReleaseGenerator" (fun _ ->
    StageAll ""
    Git.CommitMessage.setMessage "" (release.Notes |> List.fold (fun r s -> r + s + "\n") "")
    Git.Commit.Commit "" (sprintf "Bump version to %s" release.NugetVersion)
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
    Git.CommitMessage.setMessage tempReleaseDir (release.Notes |> List.fold (fun r s -> r + s + "\n") "")
    Git.Commit.Commit tempReleaseDir (sprintf "Release %s" release.NugetVersion)
    Branches.pushBranch tempReleaseDir "origin" "templates"
)

// --------------------------------------------------------------------------------------
// Run generator by default. Invoke 'build <Target>' to override
// --------------------------------------------------------------------------------------

Target "Default" DoNothing

RunTargetOrDefault "Default"
