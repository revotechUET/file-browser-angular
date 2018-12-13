const async = require('../../vendor/js/async.min');
const helper = require('../dialog-helper');

module.exports = function (ModalService, Upload, fileExplorerCtrl, callback) {
  modalController.$inject = ['$scope', 'close'];
  function modalController($scope, close) {
    let self = this;

    this.uploadFileList = [];
    this.uploadUrl = fileExplorerCtrl.uploadUrl + encodeURIComponent(fileExplorerCtrl.rootFolder + fileExplorerCtrl.currentPath.join('/'));
    ;

    this.addForUpload = function ($files) {
      self.uploadFileList = self.uploadFileList.concat($files);
    }

    this.removeFromUpload = function (index) {
      self.uploadFileList.splice(index, 1);
    }

    this.uploadFiles = function () {
      // console.log(self.uploadUrl);
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
    }

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
}