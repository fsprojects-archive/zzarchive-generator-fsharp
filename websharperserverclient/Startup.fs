namespace <%= namespace %>

open Owin
open Microsoft.Owin
open System
open System.Web
open Microsoft.Owin.Hosting
open Microsoft.Owin.StaticFiles
open Microsoft.Owin.FileSystems
open WebSharper.Owin

[<Sealed>]
type Startup() =
    member __.Configuration(builder: IAppBuilder) =
        let path =  AppDomain.CurrentDomain.SetupInformation.ApplicationBase
        builder.UseStaticFiles( StaticFileOptions( FileSystem = PhysicalFileSystem(path)))
               .UseSitelet(path, Site.Main)
        |> ignore
