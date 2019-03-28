const helper = require('../dialog-helper');
require('./new-folder-modal.css');

module.exports = function (ModalService, fileExplorerCtrl, callback) {
  modalController.$inject = ['$scope', 'close'];

  function modalController($scope, close) {
    let self = this;
    this.newFolderUrl = fileExplorerCtrl.newFolderUrl;
    /*self.metaData = [
      {name: "name", value: self.folderName},
      {name: "type", value: 'Folder'},
      {name: "size", value: 0},
      {
        name: "location",
        value: fileExplorerCtrl.rootFolder + fileExplorerCtrl.currentPath.map(c => c.rootName).join('/') + '/' + self.folderName
      },
      {name: "author", value: window.localStorage.getItem('username')},
      {name: "uploaded", value: Date.now()},
      {name: "modified", value: Date.now()},
      {name: "source", value: "Desktop Uploaded"},
      {name: "field", value: ""}, //from selected well box
      {name: "well", value: ""}, // wells in project
      {name: "welltype", value: ""}, // from selected well box
      {name: "parameter", value: ""}, //select parameter task from list params set
      {name: "datatype", value: "Other"}, //single select box
      {name: "quality", value: 5}, //1-5
      {name: "relatesto", value: ""},
      {name: "description", value: ""},
    ];
*/
    self.metaData = {
      name: self.folderName,
      type: 'Folder',
      size: 0,
      location: fileExplorerCtrl.rootFolder + fileExplorerCtrl.currentPath.map(c => c.rootName).join('/') + '/' + self.folderName,
      author: window.localStorage.getItem('username'),
      uploaded: Date.now(),
      modified: Date.now(),
      source: 'Desktop Uploaded',
      field: '',
      well: '',
      welltype: '',
      parameter: '',
      datatype: 'Other',
      quality: '5',
      relatesto: '',
      description: ''
    }
    this.folderName = '';
    self.changeFolderName = function () {
      let copiedData = angular.copy(self.metaData); // to hook $onchanges func
      self.metaData = {};
      self.metaData = copiedData;
      self.metaData.name = self.folderName;
      self.metaData.location = fileExplorerCtrl.rootFolder + fileExplorerCtrl.currentPath.map(c => c.rootName).join('/') + '/' + self.folderName;
    };

    this.createFolder = function () {
      let data = {};
      for (let key in self.metaData) {
        data[key] = self.metaData[key] + '';
      }
      let queryStr = `dest=${encodeURIComponent(fileExplorerCtrl.rootFolder + fileExplorerCtrl.currentPath.map(c => c.rootName).join('/'))}&name=${encodeURIComponent(self.folderName)}&metaData=${encodeURIComponent(JSON.stringify(data))}`;

      fileExplorerCtrl.httpGet(self.newFolderUrl + queryStr, res => {
        console.log(res);
        close(null);
        fileExplorerCtrl.goTo(fileExplorerCtrl.currentPath.length - 1);
      })
    };
    self.updateMetaData = function(metaData) {
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