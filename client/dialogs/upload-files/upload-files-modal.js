const async = require('../../vendor/js/async.min');
const helper = require('../dialog-helper');
require('./upload-files-modal');

module.exports = function (ModalService, Upload, fileExplorerCtrl, callback) {
  modalController.$inject = ['$scope', 'close'];

  function modalController($scope, close) {
    let self = this;

    // self.metaData = [];

    this.uploadFileList = [];
    self.selectedFile = null;
    // self.data = {};

    this.addForUpload = function ($files) {
      self.selectedFile = $files[0];
      self.uploadFileList = self.uploadFileList.concat($files);
      async.each(self.uploadFileList, (file, next) => {
        file.metaData = [
          {name: "name", value: file.name},
          {name: "type", value: (file.type || file.type !== '') ? file.type : 'Unknown'},
          {name: "size", value: file.size},
          {
            name: "location",
            value: fileExplorerCtrl.rootFolder + fileExplorerCtrl.currentPath.join('/') + '/' + file.name
          },
          {name: "author", value: window.localStorage.getItem('username')},
          {name: "uploaded", value: Date.now()},
          {name: "modified", value: file.lastModified},
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
        next();
      });
    };

    this.removeFromUpload = function (index) {
      self.uploadFileList.splice(index, 1);
    };

    this.uploadFiles = function () {
      // console.log(self.uploadUrl);
      fileExplorerCtrl.requesting = !fileExplorerCtrl.requesting;
      async.each(self.uploadFileList, (file, next) => {
        let metaDataRequest = {};
        file.metaData.forEach(m => {
          metaDataRequest[m.name.replace(/\s/g, '')] = m.value + ''
        });
        self.uploadUrl = fileExplorerCtrl.uploadUrl + encodeURIComponent(fileExplorerCtrl.rootFolder + fileExplorerCtrl.currentPath.join('/')) + '&metaData=' + encodeURIComponent(JSON.stringify(metaDataRequest));
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

    self.addMetadata = function (selectedFile) {
      selectedFile.metaData.push({
        name: ("field " + (selectedFile.metaData.length + 1)).replace(/\s/g, ''),
        value: ("value " + (selectedFile.metaData.length + 1))
      });
    };

    self.removeMetadata = function (m) {
      _.remove(self.selectedFile.metaData, el => {
        return el.name === m.name;
      })
    };

    self.selectFile = function (uploadFile) {
      self.selectedFile = uploadFile;
      console.log("Doi ne ", self.selectedFile);
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