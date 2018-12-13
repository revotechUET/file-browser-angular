const helper = require('../dialog-helper');

module.exports = function (ModalService, data, callback) {
    modalController.$inject = ['$scope', 'close'];
    function modalController($scope, close) {
        let self = this;

        this.base64Data = data.fileContent;
        this.title = data.title;

        this.closeModal = function () {
            close(null);
        }
    }

    ModalService.showModal({
        template: require('./pdf-viewer-modal.html'),
        controller: modalController,
        controllerAs: 'self'
    }).then((modal) => {
        helper.initModal(modal);
        modal.close.then(data => {
            helper.removeBackdrop();
            if (callback)
                callback(data);
        })
    })
}