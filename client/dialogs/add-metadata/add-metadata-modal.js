const helper = require('../dialog-helper');
const utils = require('../../js/utils');
require('./add-metadata-modal.css');

module.exports = function (ModalService, metadata, callback) {
  modalController.$inject = ['$scope', 'close'];

  function modalController($scope, close) {
    // console.log(fileExplorerCtrl);
    let self = this;
    self.warning = '';
    self.name = '';
    self.value = '';
    try {
      self.autocompleteSource = $scope.$root.taxonomies['Custom Metadata'].map(i => i.item);
    } catch (e) {}
    let fixKeys = ['name', 'type', 'size', 'location', 'author', 'uploaded', 'modifided', 'source', 'parameter', 'quality', 'relatesto'];
    this.onOk = function () {
      if(!utils.validateKey(self.name)) {
        self.warning = "A key can't contain any of the following characters / \\ : * ? \" < > | ";
        return;
      };
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