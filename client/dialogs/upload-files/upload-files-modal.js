const async = require('../../vendor/js/async.min');
const helper = require('../dialog-helper');
require('./upload-files-modal.css');

module.exports = function (ModalService, Upload, fileExplorerCtrl, callback) {
  modalController.$inject = ['$scope', 'close'];

  function modalController($scope, close) {
    let self = this;

    this.uploadFileList = [];
    this.uploadFolderList = [];
    self.selectedFile = null;
    self.selectedFolder = null;
    self.processing = false;
    self.multiMD = true;
    self.metaData4All = {
      datatype: '',
      description: ''
    };
    this.addForUpload = function ($files, isFolderUpload) {
      self.selectedFile = $files[0];
      self.uploadFileList = _.union(self.uploadFileList, $files);
      async.each(self.uploadFileList, (file, next) => {
        file.desDirectory = '';
        if (isFolderUpload) {
          file.desDirectory = '/' + file.webkitRelativePath.substring(0, file.webkitRelativePath.lastIndexOf('/'));
        }
        let currentTime = Date.now() + '';
        file.uploadingProgress = null;
        file.overwrite = false;
        file.existed = false;
        file.metaData = {
          name: file.name,
          type: (file.type || file.type !== '') ? file.type : 'Unknown',
          size: file.size,
          location: (fileExplorerCtrl.rootFolder + fileExplorerCtrl.currentPath.map(c => c.rootName).join('/') + file.desDirectory + '/' + file.name).replace('//', '/'),
          author: window.localStorage.getItem('username'),
          uploaded: currentTime,
          modified: currentTime,
          // modified: file.lastModified,
          source: 'Desktop Uploaded',
          field: '',
          // well: '{}',
          welltype: '',
          // parameter: '',
          datatype: '',
          quality: '5',
          relatesto: '{}',
          description: ''
        };
        next();
      });
    };

    this.removeFromUpload = function (index) {
      if (self.uploadFileList[index].uploadingObject) self.uploadFileList[index].uploadingObject.abort();
      self.uploadFileList.splice(index, 1);
      self.selectedFile = null;
      if (self.uploadFileList.length === 0) self.processing = false;
      // !$scope.$$phase && $scope.$digest();
    };
    this.folderPicked = function (files) {
      console.log(files);
      self.addForUpload(files, true);
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const path = file.webkitRelativePath.split('/');
        path.pop();
        let folderName = path[path.length - 1];
        let folder = {
          path: path.join('/'),
          name: folderName,
          metaData: {
            name: folderName,
            type: 'Folder',
            size: 0,
            location: (fileExplorerCtrl.rootFolder + fileExplorerCtrl.currentPath.map(c => c.rootName).join('/') + '/' + path.join('/')).replace('//', '/'),
            author: window.localStorage.getItem('username'),
            uploaded: Date.now() + '',
            modified: Date.now() + '',
            source: 'Desktop Uploaded',
            field: '',
            welltype: '',
            datatype: '',
            quality: '5',
            relatesto: '{}',
            description: ''
          }
        };
        if (self.uploadFolderList.findIndex(f => f.path === folder.path) === -1) {
          self.uploadFolderList.push(folder);
        }
      }
      self.uploadFolderList.sort((a, b) => {
        return a.path.split('/').length - b.path.split('/').length;
      });
      console.log(self.uploadFolderList);
    };
    this.createFolder = function (cb) {
      async.eachSeries(self.uploadFolderList, (folder, next) => {
        for (let key in folder.metaData) {
          folder.metaData[key] = folder.metaData[key] + '';
        }
        let queryStr = `dest=${encodeURIComponent(folder.metaData.location.substring(0, folder.metaData.location.lastIndexOf('/')))}&name=${encodeURIComponent(folder.name)}&metaData=${encodeURIComponent(JSON.stringify(folder.metaData))}`;

        fileExplorerCtrl.httpGet(fileExplorerCtrl.newFolderUrl + queryStr, res => {
          console.log(res);
          folder.isDone = true;
          next();
        }, err => {
          console.log(err);
        })
      }, () => {
        cb()
      });
    };
    this.getExistedFiles = function () {
      return self.uploadFileList.filter(f => f.existed);
    }
    this.overwriteAllFiles = function () {
      self.uploadFileList.map(file => { file.overwrite = true });
      self.uploadFiles();
    }
    this.uploadFiles = function (index) {
      if (_.isFinite(index)) {
        self.uploadFileList[index].overwrite = true;
      }
      // fileExplorerCtrl.requesting = !fileExplorerCtrl.requesting;
      self.processing = true;
      self.selectedFile = null;
      self.createFolder(() => {
        async.each(self.uploadFileList, (file, next) => {
            if (file.uploadingProgress || (file.existed && !file.overwrite)) {
              next();
            } else {
              let metaDataRequest = {};
              for (let key in file.metaData) {
                metaDataRequest[key] = file.metaData[key] + '';
              }
              /*file.metaData.forEach(m => {
                metaDataRequest[m.name.replace(/\s/g, '')] = m.value + ''
              });*/
              fileExplorerCtrl.httpGet(fileExplorerCtrl.checkFileExistedUrl + encodeURIComponent(JSON.stringify(metaDataRequest)), result => {
                if (result.data.code === 409 && !file.overwrite) {
                  console.log("Vao day");
                  let index = self.uploadFileList.findIndex(f => _.isEqual(f, file));
                  self.uploadFileList[index].existed = true;
                  self.uploadFileList[index].uploadingProgress = null;
                  self.uploadFileList[index].overwrite = false;
                  next();
                } else {
                  self.uploadUrl = fileExplorerCtrl.uploadUrl + encodeURIComponent(fileExplorerCtrl.rootFolder + fileExplorerCtrl.currentPath.map(c => c.rootName).join('/') + file.desDirectory) + '&metaData=' + encodeURIComponent(JSON.stringify(metaDataRequest)) + '&overwrite=' + file.overwrite;
                  file.uploadingObject = Upload.upload({
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
                  });
                  file.uploadingObject.then(resp => {
                    self.uploadFileList.splice(self.uploadFileList.findIndex(f => _.isEqual(f, file)), 1);
                    console.log(resp);
                    next();
                  }, err => {
                    console.log('Error status: ' + err);
                  }, event => {
                    let percentage = event.loaded / event.total * 100;
                    if (event.type === "load") {
                      file.uploadingProgress.status = "Uploaded ...";
                    }
                    file.uploadingProgress = {
                      progress: percentage,
                      status: "Uploading ..."
                    };
                    !$scope.$$phase && $scope.$digest();
                  });
                  file.uploadingObject.catch(err => {
                    console.log("Upload terminated", err.message);
                  });
                }
              });
            }
          }, err => {
            if (!err && self.uploadFileList.length === 0) {
              // fileExplorerCtrl.requesting = !fileExplorerCtrl.requesting;
              console.log('===upload files done');
              fileExplorerCtrl.goTo(fileExplorerCtrl.currentPath.length - 1);
              close();
            }
          }
        );
      });
    };

    self.updateMetaData = function (metaData) {
      self.selectedFile.metaData = metaData;
    };
    self.updateMD4All = function (metaData) {
      self.uploadFileList.forEach(file => {
        file.metaData = Object.assign(file.metaData, metaData);
      });
    };
    self.addMetadata = function () {
      self.metaData4All.moreInfo[''] = '';
    };

    self.selectFile = function (uploadFile, index) {
      self.selectedFile = uploadFile;
      console.log("Doi ne ", self.selectedFile);
    };

    self.selectFolder = function (uploadFolder, index) {
      self.selectedFolder = uploadFolder;
      console.log("Doi ne ", self.selectedFolder);
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
}
;