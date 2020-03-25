const helper = require('../dialog-helper');

module.exports = function (ModalService, metadata, title, callback) {
  modalController.$inject = ['$scope', 'close'];

  function modalController($scope, close) {
    this.metadata = metadata;
    this.title = (title || '');
    this.closeModal = function () {
      close(null);
    }
  }

  ModalService.showModal({
    template: require('./metadata-modal.html'),
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
