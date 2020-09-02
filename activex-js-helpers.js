(function () {
    var registeredObjects = [];
    var handlers = [];

    var trigger = function (objectIndex, eventName, params) {
        var obj = registeredObjects[objectIndex];
        handlers[objectIndex][eventName].forEach(function (x) {
            x.call(obj, params);
        });
    };

    ActiveXObject.on = function (obj, eventName, parameterNames, handler) {
        if (Object.prototype.toString.call(parameterNames) !== '[object Array]') {
            //parameterNames is an optional argument
            handler = parameterNames;
            parameterNames = [];
        }

        var objectIndex = registeredObjects.indexOf(obj);
        if (objectIndex == -1) {
            registeredObjects.push(obj);
            objectIndex = registeredObjects.length - 1;
            handlers[objectIndex] = {};
        }
        if (handlers[objectIndex][eventName] === undefined) { //explicit check against undefined, because it might be an empty array
            var def = "function obj::" + eventName + " (" + parameterNames.join(', ') + ") {" +
                "var params = { " +
                parameterNames.map(function (x) {
                    return x + ':' + x;
                }).join(',') +
                " };" +
                "trigger( " + objectIndex + ", '" + eventName + "', params);" +
                parameterNames.map(function (x) {
                    return "if ( " + x + " !== params." + x + " ) " + x + " = params." + x + ";";
                }).join('\n') +
                "};";
            eval(def);
            handlers[objectIndex][eventName] = [];
        }
        handlers[objectIndex][eventName].push(handler);
    };

    ActiveXObject.off = function (obj, eventName, handler) {
        if (!obj) {
            registeredObjects.forEach(function (x) {
                ActiveXObject.off(x);
            });
            registeredObjects = [];
            return;
        }

        var objectIndex = registeredObjects.indexOf(obj);
        var handlersObject = handlers[objectIndex];
        if (!eventName) {
            Object.keys(handlersObject).forEach(function (x) {
                ActiveXObject.off(obj, x);
            });
            registeredObjects[objectIndex] = undefined;
            return;
        }

        if (!handler) {
            handlersObject[eventName] = [];
            return;
        }

        var handlerIndex = handlersObject[eventName].indexOf(handler);
        while (handlerIndex > -1) {
            handlersObject[eventName][handlerIndex] = undefined;
            handlerIndex = handlersObject[eventName].indexOf(handler);
        }
    };

    ActiveXObject.hasRegisteredObjects = function () {
        return registeredObjects.length > 0;
    };

    ActiveXObject.set = function (obj, propertyName, parameters, newValue) {
        /*@cc_on @*/
        /*@
        switch (parameters.length) {
            case 0:
                obj[propertyName] = newValue;
                return;
            case 1:
                obj[propertyName](parameters[0]) = newValue;
                return;
            case 2:
                obj[propertyName](parameters[0], parameters[1]) = newValue;
                return;
            case 3:
                obj[propertyName](parameters[0], parameters[1], parameters[2]) = newValue;
                return;
            default:
                break; // fallback to eval
        }
        @*/
        var parameterString = parameters.map(function (x, index) {
            return 'parameters[' + index + ']';
        }).join(', ');
        var callString = parameterString ? '(' + parameterString + ')' : "";
        eval('obj[propertyName]' + callString + ' = newValue');
    };
})();