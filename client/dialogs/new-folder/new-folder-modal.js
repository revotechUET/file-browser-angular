const helper = require('../dialog-helper');
require('./new-folder-modal.css');

module.exports = function (ModalService, fileExplorerCtrl, callback) {
  modalController.$inject = ['$scope', 'close'];

  function modalController($scope, close) {
    let self = this;
    this.newFolderUrl = fileExplorerCtrl.newFolderUrl;
    self.metaData = [];

    this.folderName = '';

    this.createFolder = function () {
      let data = {};
      self.metaData.forEach(m => {
        data[m.name.replace(/\s/g, '')] = m.value
      });
      let queryStr = `dest=${encodeURIComponent(fileExplorerCtrl.rootFolder + fileExplorerCtrl.currentPath.join('/'))}&name=${encodeURIComponent(self.folderName)}&metaData=${encodeURIComponent(JSON.stringify(data))}`;

      fileExplorerCtrl.httpGet(self.newFolderUrl + queryStr, res => {
        console.log(res);
        close(null);
        fileExplorerCtrl.goTo(fileExplorerCtrl.currentPath.length - 1);
      })
    };

    self.addMetadata = function () {
      self.metaData.push({
        name: ("field " + (self.metaData.length + 1)).replace(/\s/g, ''),
        value: ("value " + (self.metaData.length + 1))
      });
    };

    self.removeMetadata = function (m) {
      _.remove(self.metaData, el => {
        return el.name === m.name;
      })
    };

    this.closeModal = function () {
      close(null);
    }
  }

  ModalService.showModal({
    template: require('./new-folder-modal.html'),
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