namespace <%= namespace %>

open Owin
open Microsoft.Owin
open System
open System.Web

[<Sealed>]
type Startup() =
    member __.Configuration(builder: IAppBuilder) =
        ()
