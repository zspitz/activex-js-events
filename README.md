# activex-js-events

There are a [number of mechanisms for handling ActiveX events](https://msdn.microsoft.com/en-us/library/ms974564.aspx) in Javascript; however, they all rely on:
* the variable pointing to the event source, and the event handler, must both be in the global namespace
* the variable must be initialized before the function declaration is evaluated. This is harder than it seems, because of [function declaration hoisting](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function#Function_declaration_hoisting); and must rely either on:
   * some form of string->code evaluation -- `eval`, `setTimeout`, `window.execScript`, `new Function` -- or
   * containing the function within a `SCRIPT` block, while the initialization happens before the `SCRIPT` block
* the function must have a special name -- depending on the environment and event handling mechanism, either `variable.eventName`, `variable::eventName`, or `variable_eventName`
* the function must be a [function declaration](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions#Defining_functions), not a function expression
* the parameters of the function must match those defined in the ActiveX event

```
var wdApp = new ActiveXObject('Word.Application');

eval('function wdApp::Quit() {window.alert(\'Application quit\');}');
```

This library enables the following:
```
(function() {
  //not in the global namespace
  var wdApp = new ActiveXObject('Word.Application');
  
  //using a function expression, without a special name
  ActiveXObject.on(wdApp, 'Quit', function() {
    window.alert('Application quit');
    
    //`this` binding
    window.alert(this.Version);
  });

  //AFAIK there is no way to determine the event's parameters at runtime, so they must be passed in
  ActiveXObject.on(wdApp, 'DocumentBeforeSave', ['Doc','SaveAsUI','Cancel'], function (params) {
    //changes to the `params` object are propagated back to the internal handler
    params.SaveAsUI = false;
    params.Cancel = !window.confirm("Do you really want to save?");   
  });
})();
