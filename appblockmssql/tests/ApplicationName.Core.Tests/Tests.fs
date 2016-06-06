module ApplicationName.Core.Tests

open ApplicationName.Core
open NUnit.Framework

#if DEMO
[<Test>]
let ``hello returns 42`` () =
  let result = Library.hello 42
  printfn "%i" result
  Assert.AreEqual(42,result)
#endif
