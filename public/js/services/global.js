'use strict';

//Global service for global variables
angular.module('mean.system').factory('Global', [
    function() {
        var _this = this;
        _this._data = {
            user: window.user,
            authenticated: !! window.user
        };
        return _this._data;
    }
])
.factory('AppAlert', ['$rootScope',
    function($rootScope) {
        var alertService;
        $rootScope.alerts = [];
        return alertService = {
          add: function(type, msg) {
            return $rootScope.alerts.push({
              type: type,
              msg: msg,
              close: function() {
                return alertService.closeAlert(this);
              }
            });
          },
          closeAlert: function(alert) {
            return this.closeAlertIdx($rootScope.alerts.indexOf(alert));
          },
          closeAlertIdx: function(index) {
            console.log('quise cerrar');
            return $rootScope.alerts.splice(index, 1);
          },
          clear: function(){
            $rootScope.alerts = [];
          }
        };
      }
]);
