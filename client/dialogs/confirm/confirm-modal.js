const async = require('../../vendor/js/async.min');
const helper = require('../dialog-helper');

module.exports = async function (ModalService, confirmMessage, callback) {
    function ModalController($scope, close) {
        this.confirmMsg = confirmMessage;
        this.close = function (ret) {
            close(ret);
        }
    }

    const modal = await ModalService.showModal({
        // templateUrl: "confirm-modal.html",
        template: require('./confirm-modal.html'),
        controller: ModalController,
        controllerAs: 'wiModal'
    });
    helper.initModal(modal);
    modal.close.then(function (ret) {
        helper.removeBackdrop();
        callback && callback(ret);
    });
    return modal;
}