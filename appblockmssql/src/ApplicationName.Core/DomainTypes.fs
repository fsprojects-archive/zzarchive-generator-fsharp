namespace ApplicationName.Core

module DomainTypes =

#if DEMO
  [<CLIMutable>]
  type Person = {
      FirstName:string
      LastName:string
  }
#endif
