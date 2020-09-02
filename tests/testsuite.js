var startActiveXObjectSetTests = (function () {
    var testLogger;

    if (typeof console === 'object') {
        testLogger = console;
    } else if (typeof WScript !== 'undefined') {
        testLogger = {
            error: function () {
                var args = Array.prototype.slice.call(arguments);
                WScript.StdErr.WriteLine('Error: ' + args.join(' '));
            },
            log: function () {
                var args = Array.prototype.slice.call(arguments);
                WScript.Echo('Info: ' + args.join(' '));
            }
        };
    } else {
        throw new Error('Unknown environment');
    }

    function assertLog(exp, message) {
        if (exp === true) {
            testLogger.log(message);
            return;
        }
        testLogger.error(message);
    }

    function getWSCObject(wscPath) {
        var fso = new ActiveXObject('Scripting.FileSystemObject');
        wscPath = fso.GetAbsolutePathName(wscPath);
        return GetObject('Script:' + wscPath);
    }

    function setPropertyTestJob(description, obj, property, parameters, value) {
        this.description = description;
        this.object = obj;
        this.property = property;
        this.parameters = parameters;
        this.value = value;
    }

    return function () {
        var propertyName = 'Item';
        var factory = getWSCObject('classfactory.wsc');

        var objWith0Param = factory.CreateClassWithZeroParamProp();
        ActiveXObject.set(objWith0Param, propertyName, [], 'foo');
        assertLog(objWith0Param[propertyName] === 'foo', 'No parameter');

        var objWith1Param = factory.CreateClassWithOneParamProp();
        ActiveXObject.set(objWith1Param, propertyName, ['b'], 'Beirut');
        assertLog(objWith1Param[propertyName]('b') === 'Beirut', 'One parameter');

        var objWith2Param = factory.CreateClassWithTwoParamProp();
        ActiveXObject.set(objWith2Param, propertyName, ['b', 'p'], 'Beirut, Paris');
        assertLog(objWith2Param[propertyName]('b', 'p') === 'Beirut, Paris', 'Two parameters');

        var objWith3Param = factory.CreateClassWithThreeParamProp()
        ActiveXObject.set(objWith3Param, propertyName, ['b', 'p', 'l'], 'Beirut, Paris, London');
        assertLog(objWith3Param[propertyName]('b', 'p', 'l') === 'Beirut, Paris, London', 'Three parameters');

        var objWith4Param = factory.CreateClassWithFourParamProp();
        ActiveXObject.set(objWith4Param, propertyName, ['b', 'p', 'l', 'n'], 'Beirut, Paris, London, Rome');
        assertLog(objWith4Param[propertyName]('b', 'p', 'l', 'n') === 'Beirut, Paris, London, Rome', 'Four parameters (with eval fallback)');

        var jobs = [
            new setPropertyTestJob('No parameters property set:', objWith0Param, propertyName, [], 'foo'),
            new setPropertyTestJob('One parameter property set:', objWith1Param, propertyName, ['x'], 'x'),
            new setPropertyTestJob('Two parameters property set:', objWith2Param, propertyName, ['x', 'y'], 'xy'),
            new setPropertyTestJob('Three parameters property set:', objWith3Param, propertyName, ['x', 'y', 'z'], 'xyz'),
            new setPropertyTestJob('Four parameters property set (with eval fallback):', objWith4Param, propertyName, ['a', 'b', 'c', 'd'], 'abcd')
        ];

        testLogger.log('Simple benchmarking work in progress...');

        jobs.forEach(function (job) {
            var count = 16000;
            var start = new Date();
            for (var i = 0; i < count; i++) {
                ActiveXObject.set(job.object, job.property, job.parameters, job.value);
            }
            var end = new Date();
            var diff = ((end - start) / 1000);
            testLogger.log(job.description, count, 'setting process took', diff, 'seconds');
        });

        testLogger.log('Completed.');
    }
})();