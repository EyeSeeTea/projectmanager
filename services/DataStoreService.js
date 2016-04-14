appManagerMSF.factory("DataStoreService", ['DataStore','meUser', '$q', function(DataStore, meUser, $q) {

    var namespace = "project_manager";
    var userid = null;
    var defaultArrayKey = "values";

    var getUserId = function() {
        // Get current user id
        if (userid != null){
            return $q.when(userid);
        } else {
            return meUser.get({fields: 'id'}).$promise
                .then(function (user) {
                    userid = user.id;
                    return userid;
                });
        }
    };

    var getCurrentUserSettings = function() {
        return getUserId().then(function(userid){
            return DataStore.get({namespace: namespace, key: userid}).$promise
        });
    };

    /**
     *
     * @param module Module name (like "availableData", "resetpasswd",...)
     * @param property With the syntax {"key": "property-name", "value": "property-value"}
     * @returns {*}
     */
    var updateCurrentUserSettings = function(module, property){
        var userSettings = {};
        return getCurrentUserSettings()
            .then(function(successResult){
                userSettings = successResult;
                // Update userSettings with new property, without modifying the others
                if(userSettings[module] == undefined)
                    userSettings[module] = {};
                userSettings[module][property.key] = property.value;
                return getUserId().then(function(userid){
                    return DataStore.put({namespace:namespace, key:userid}, userSettings);
                });
            },
            function(){
                userSettings[module] = {};
                userSettings[module][property.key] = property.value;
                return getUserId().then(function(userid){
                    return DataStore.post({namespace:namespace, key:userid}, userSettings);
                });
            });
    };

    /**
     * Introduces a new value in the array. This methods expects the value of the pair (namespace, key) to be an array.
     * If the value is empty, it creates a new array.
     * @param namespace Name of the namespace
     * @param key Name of the key
     * @param value New value to be pushed into the array
     * @returns {*} Promise with the result of the put/post method
     */
    var updateNamespaceKeyArray = function(namespace, key, value){
        return getNamespaceKeyValue(namespace, key)
            .then(function(currentValue){
                currentValue[defaultArrayKey].push(value);
                return DataStore.put({namespace: namespace, key: key}, currentValue);
            },
            function(noData){
                var currentValue = {};
                currentValue[defaultArrayKey] = [value];
                return DataStore.save({namespace: namespace, key: key}, currentValue);
            }
        )
    };

    /**
     * Get currentValue for the pair (namespace, key)
     * @param namespace Name of the namespace
     * @param key Name of the key
     * @returns {*|g|n} Promise with the value of the pair (namespace, key)
     */
    var getNamespaceKeyValue = function(namespace, key){
        return DataStore.get({namespace: namespace, key: key}).$promise;
    };

    return {
        getCurrentUserSettings: getCurrentUserSettings,
        getNamespaceKeyValue: getNamespaceKeyValue,
        updateNamespaceKeyArray: updateNamespaceKeyArray
    };

}]);