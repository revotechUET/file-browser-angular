const helper = require('../dialog-helper');
require('./add-metadata-modal.css');

module.exports = function (ModalService, metadata, callback) {
  modalController.$inject = ['$scope', 'close'];

  function modalController($scope, close) {
    // console.log(fileExplorerCtrl);
    let self = this;
    self.warning = '';
    self.name = '';
    self.value = '';
    let fixKeys = ['name', 'type', 'size', 'location', 'author', 'uploaded', 'modifided', 'source', 'parameter', 'quality', 'relatesto'];
    this.onOk = function () {
      let name = self.name.replace(/ /g, "%20");
      for(key in metadata) {
        if(name.toLowerCase() == key.toLowerCase()
            || fixKeys.find(k => k == name.toLowerCase())) {
          self.warning = "Meta data's key existed!";
          return;
        }
      };
      close({name: name, value: self.value});
    }
    this.closeModal = function () {
      close(null);
    }
  }

  ModalService.showModal({
    template: require('./add-metadata-modal.html'),
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