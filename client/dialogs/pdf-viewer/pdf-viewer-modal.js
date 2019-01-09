const helper = require('../dialog-helper');

module.exports = function (ModalService, fileExplorerCtrl, data, item, callback) {
    modalController.$inject = ['$scope', '$element', 'close'];
    function modalController($scope, $element, close) {
        let self = this;

        self.body = $element.find('#body');
        self.body.bind('scroll', () => {
            if (self.body[0].scrollTop + self.body[0].offsetHeight >= self.body[0].scrollHeight) {
                console.log('bottom');
                self.pdfViewerCtrl.loadMore();
            }
        })

        this.base64Data = data.fileContent;
        this.title = data.title;
        this.pagesToShow = 10;

        this.download = function () {
            fileExplorerCtrl.downloadFile(item);
        };

        this.getPdfViewerCtrl = function (ctrl) {
            self.pdfViewerCtrl = ctrl;
            console.log('bind');
        }

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