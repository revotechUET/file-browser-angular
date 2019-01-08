require('./text-viewer.less');

const moduleName = 'text-viewer';
const componentName = 'textViewer';

Controller.$inject = [];
function Controller() {
    let self = this;

    this.$onInit = function () {
        self.fileContent = self.fileContent || '';
    }
}

let app = angular.module(moduleName, []);

app.component(componentName, {
    template: require('./text-viewer.html'),
    controller: Controller,
    controllerAs: 'self',
    bindings: {
        fileContent: '<'
    }
})

module.exports.name = moduleName;