namespace <%= namespace %>

open System.Web.Http

[<RoutePrefix("api/home")>]
type HomeController() =
    inherit ApiController()

    [<Route>]
    member this.Get() = "Hello World!"
