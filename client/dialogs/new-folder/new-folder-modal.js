const helper = require('../dialog-helper');
const utils = require('../../js/utils');
require('./new-folder-modal.css');

module.exports = function (ModalService, fileExplorerCtrl, callback) {
  modalController.$inject = ['$scope', 'close'];

  function modalController($scope, close) {
    let self = this;
    const toastr = window.__toastr || window.toastr;
    this.newFolderUrl = fileExplorerCtrl.newFolderUrl;
    self.metaData = {
      name: self.folderName,
      type: 'Folder',
      size: 0,
      location: (fileExplorerCtrl.rootFolder + fileExplorerCtrl.currentPath.map(c => c.rootName).join('/') + '/').replace('//', '/'),
      author: window.localStorage.getItem('username'),
      uploaded: Date.now(),
      modified: Date.now(),
      source: 'Project Storage',
      field: '',
      well: '{}',
      welltype: '',
      // parameter: '',
      datatype: '',
      quality: '5',
      relatesto: '{}',
      description: ''
    }
    this.folderName = '';
    let oldName = ''
    self.changeFolderName = function () {
      if (!self.validateName()) {
        toastr.error(`File name can not contain special characters except for !-_.'"()`);
        self.folderName = oldName;
        return;
      }
      oldName = self.folderName;
      self.metaData = {
        ...self.metaData,
        name: self.folderName,
        location: (fileExplorerCtrl.rootFolder + fileExplorerCtrl.currentPath.map(c => c.rootName).join('/') + '/' + (self.folderName || '')).replace('//', '/'),
      }
    };
    self.validateName = function () {
      return utils.validateNodeName(self.folderName);
    }

    this.createFolder = function () {
      let data = {};
      for (let key in self.metaData) {
        data[key] = self.metaData[key] + '';
      }
      if (!utils.validateNodeName(self.folderName)) {
        toastr.error("a file/folder can't contain any of the following characters / \\ : * ? \" < > | ");
        return;
      }
      let queryStr = `dest=${encodeURIComponent(fileExplorerCtrl.rootFolder + fileExplorerCtrl.currentPath.map(c => c.rootName).join('/'))}&name=${encodeURIComponent(self.folderName)}&metaData=${encodeURIComponent(JSON.stringify(data))}`;

      fileExplorerCtrl.httpGet(self.newFolderUrl + queryStr, res => {
        if (!res.data.error) {
          close(null);
          fileExplorerCtrl.goTo(fileExplorerCtrl.currentPath.length - 1);
        }
      })
    };
    self.updateMetaData = function (metaData) {
      self.metaData = metaData;
    }
    /*
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
        };*/

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