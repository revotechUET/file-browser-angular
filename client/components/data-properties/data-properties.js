const componentName = 'dataProperties';
const moduleName = 'data-properties';
require('./data-properties.css');

function Controller() {
    let self = this;

    self.$onInit = function () {
        console.log("-________-", self.metaData);
    }

}


let app = angular.module(moduleName, []);
app.component(componentName, {
    template: require('./data-properties.html'),
    controller: Controller,
    controllerAs: componentName,
    bindings: {
        metaData: '<'
    }
});

exports.name = moduleName;