const async = require('../../vendor/js/async.min');
const helper = require('../dialog-helper');
require('./upload-files-modal');

module.exports = function (ModalService, Upload, fileExplorerCtrl, callback) {
  modalController.$inject = ['$scope', 'close'];

  function modalController($scope, close) {
    let self = this;

    self.metaData = [];

    this.uploadFileList = [];
    self.data = {};

    this.addForUpload = function ($files) {
      self.uploadFileList = self.uploadFileList.concat($files);
    };

    this.removeFromUpload = function (index) {
      self.uploadFileList.splice(index, 1);
    };

    this.uploadFiles = function () {
      // console.log(self.uploadUrl);
      self.metaData.forEach(m => {
        self.data[m.name.replace(/\s/g, '')] = m.value
      });
      self.uploadUrl = fileExplorerCtrl.uploadUrl + encodeURIComponent(fileExplorerCtrl.rootFolder + fileExplorerCtrl.currentPath.join('/')) + '&metaData=' + encodeURIComponent(JSON.stringify(self.data));
      fileExplorerCtrl.requesting = !fileExplorerCtrl.requesting;
      async.each(self.uploadFileList, (file, next) => {
        Upload.upload({
          url: self.uploadUrl,
          headers: {
            'Content-Type': 'application/json',
            'Referrer-Policy': 'no-referrer',
            'Authorization': window.localStorage.getItem('token'),
            'Storage-Database': JSON.stringify(fileExplorerCtrl.storageDatabase)
          },
          data: {
            'upload-file': file
          }
        }).then(resp => {
          console.log('Success ' + resp);
          next();
        }, resp => {
          console.log('Error status: ' + resp);
          next();
        });
      }, err => {
        if (!err) {
          fileExplorerCtrl.requesting = !fileExplorerCtrl.requesting;
          console.log('===upload files done');
          fileExplorerCtrl.goTo(fileExplorerCtrl.currentPath.length - 1);
          close();
        }
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
    template: require('./upload-files-modal.html'),
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
};