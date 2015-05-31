namespace <%= namespace %>

open Owin
open Microsoft.Owin
open System
open System.Net.Http
open System.Web
open System.Web.Http
open System.Web.Http.Owin
open System.Web.Http.Dispatcher

module Controller =

    open System.Web.Http.Controllers
    open System.Web.Http.Dispatcher

    let homeController () = new HomeController() :> IHttpController

    let ctrls =
        dict [
            typeof<HomeController>, homeController
        ]

    let controllerActivator () =
        { new IHttpControllerActivator with
            member __.Create(request, _, ct) =
                match ctrls.TryGetValue ct with
                | true, createController -> createController ()
                | false, _ -> raise <| InvalidOperationException("unexpected controller type: " + ct.FullName) }

    let controllerTypeResolver =
        { new IHttpControllerTypeResolver with
                member __.GetControllerTypes _ = ctrls.Keys }

module Serializer =

    open System
    open Newtonsoft.Json
    open Newtonsoft.Json.Serialization
    open System.Collections.Generic
    open FifteenBelow.Json

    let private converters =
        [ OptionConverter () :> JsonConverter
          ListConverter () :> JsonConverter ]
        |> List.toArray :> IList<JsonConverter>

    let configure (settings: JsonSerializerSettings) =
        settings.NullValueHandling <- NullValueHandling.Ignore
        settings.ContractResolver <- CamelCasePropertyNamesContractResolver()
        settings.Converters <- converters
        settings.Formatting <- Formatting.Indented
        settings.TypeNameHandling <- TypeNameHandling.None
        settings

    let private defaultSettings = configure <| JsonSerializerSettings()

    let deserialize value = JsonConvert.DeserializeObject<_>(value, defaultSettings)

    let serialize value = JsonConvert.SerializeObject(value :> obj, defaultSettings)

open Controller

[<Sealed>]
type Startup() =

    let apply f (c: HttpConfiguration) = f c |> ignore; c

    let mapHttpAttributeRoutes = apply <| fun c ->
        c.MapHttpAttributeRoutes()

    let removeXmlFormatter = apply <| fun c ->
        c.Formatters.Remove(c.Formatters.XmlFormatter)

    let jsonFormatter = apply <| fun c ->
        c.Formatters.JsonFormatter.SerializerSettings
        |> Serializer.configure
        |> ignore

    let replaceControllerTypeResolver controllerTypeResolver = apply <| fun c ->
        c.Services.Replace(typeof<IHttpControllerTypeResolver>, controllerTypeResolver)

    let replaceControllerActivator (controllerActivator : IHttpControllerActivator) = apply <| fun c ->
        c.Services.Replace(typeof<IHttpControllerActivator>, controllerActivator)

    let formatters = removeXmlFormatter >> jsonFormatter

    member __.Configuration(builder: IAppBuilder) =
        new HttpConfiguration()
        |> mapHttpAttributeRoutes
        |> formatters
        |> replaceControllerTypeResolver controllerTypeResolver
        |> replaceControllerActivator (controllerActivator ())
        |> builder.UseWebApi
        |> ignore
