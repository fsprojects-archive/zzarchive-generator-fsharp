namespace <%= namespace %>

open WebSharper
open WebSharper.JavaScript
open WebSharper.UI.Next
open WebSharper.UI.Next.Client
open WebSharper.UI.Next.Html

[<JavaScript>]
module Client =

    let Start input k =
        async {
            let! data = Server.DoSomething input
            return k data
        }
        |> Async.Start

    let Main () =
        let input = inputAttr [attr.value ""] []
        let output = h1 []
        div [
            input
            buttonAttr [
                on.click (fun _ _ ->
                    async {
                        let! data = Server.DoSomething input.Value
                        output.Text <- data
                    }
                    |> Async.Start
                )
            ] [text "Send"]
            hr []
            h4Attr [attr.``class`` "text-muted"] [text "The server responded:"]
            divAttr [attr.``class`` "jumbotron"] [output]
        ]
