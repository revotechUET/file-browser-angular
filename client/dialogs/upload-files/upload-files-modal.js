const async = require('../../vendor/js/async.min');
const helper = require('../dialog-helper');
const utils = require('../../js/utils');
require('./upload-files-modal.css');
const getType = require('../../js/utils').getType;

module.exports = function (ModalService, Upload, fileExplorerCtrl, callback) {
  modalController.$inject = ['$scope', 'close'];

  function modalController($scope, close) {
    let self = this;
    const toastr = window.__toastr || window.toastr;
    this.customConfigs = {
        "name": {
            "translation": "Name",
            "option": "readonly",
            "section": "General",
            "typeSpec": null,
            "refSpec": null,
            "choices": null
        }
    }
    this.uploadFileList = [];
    this.uploadFolderList = [];
    self.selectedFile = null;
    self.selectedFolder = null;
    self.processing = false;
    self.processingFolder = false;
    self.processingName = [];
    self.multiMD = true;
    self.metaData4All = {
      well: '{}',
      block: '',
      field: '',
      welltype: '',
      datatype: '',
      quality: '5',
      description: ''
    };
    // if (!window.explorertree) {
    //   delete self.metaData4All.well;
    //   delete self.metaData4All.welltype;
    // }
    this.addForUpload = function ($files, isFolderUpload) {
      if (!$files || !$files.length) return;
      const validFiles = $files.filter(f => utils.validateNodeName(f.name));
      if (validFiles.length !== $files.length) {
        const invalidFiles = _.difference($files, validFiles);
        toastr.error('Invalid files: ' + invalidFiles.map(f => f.name).join(', '), `File name can not contain special characters except for !-_.'"()`);
      }
      $files = validFiles;
      if (!$files.length) return;
      const curLength = self.uploadFileList.length;
      self.uploadFileList = _.unionWith(self.uploadFileList, $files, (a, b) => a.name + a.size + a.lastModified === b.name + b.size + b.lastModified);
      self.isFilePicked = !isFolderUpload;
      if (self.uploadFileList.length === curLength) return;
      self.selectedFile = $files[0];
      async.each(self.uploadFileList, (file, next) => {
        file.desDirectory = '';
        if (isFolderUpload) {
          file.desDirectory = '/' + file.webkitRelativePath.substring(0, file.webkitRelativePath.lastIndexOf('/'));
        }
        let currentTime = Date.now() + '';
        file.uploadingProgress = null;
        file.overwrite = false;
        file.existed = false;
        file.type = getType(file.name);
        file.metaData = {
          name: file.name,
          type: getType(file.name),
          size: file.size,
          location: (fileExplorerCtrl.rootFolder + fileExplorerCtrl.currentPath.map(c => c.rootName).join('/') + file.desDirectory + '/' + file.name).replace('//', '/'),
          author: window.localStorage.getItem('username'),
          uploaded: currentTime,
          modified: currentTime,
          // modified: file.lastModified,
          source: 'Desktop Uploaded',
          block: '',
          field: '',
          well: '{}',
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
    this.removeFromFolder = function(folderIdx) {
      let folderPath = self.uploadFolderList[folderIdx].path;
      self.uploadFileList = self.uploadFileList.filter(file => file.desDirectory !== ('/' + folderPath));
      self.uploadFolderList.splice(folderIdx, 1);
    }
    this.removeFromUpload = function (index, type) {
      if(type === 'folder') {
        if (self.uploadFolderList[index].uploadingObject) self.uploadFolderList[index].uploadingObject.abort();
        self.removeFromFolder(index);
        self.uploadFolderList.splice(index, 1);
      } else {
        if (self.uploadFileList[index].uploadingObject) self.uploadFileList[index].uploadingObject.abort();
        self.uploadFileList.splice(index, 1);
      }
      self.selectedFile = null;
      if (self.uploadFileList.length === 0 || self.uploadFolderList === 0) {
        self.processing = false;
        self.isFilePicked = false;
      }
      // !$scope.$$phase && $scope.$digest();
    };
    this.removeAll = function () {
      self.uploadFileList.forEach((f, i) => self.removeFromUpload(i));
      self.uploadFolderList = [];
      self.uploadFileList = [];
      self.processing = false;
      self.isFilePicked = false;
    }
    this.folderPicked = function (files) {
      if (!files || !files.length) return;
      self.addForUpload(files, true);
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const paths = file.webkitRelativePath.split('/');
        paths.pop();
        const path = paths.join('/');
        const existFolder = self.uploadFolderList.find(f => f.path === path);
        if (existFolder) {
          file.folder = existFolder;
          continue;
        }
        let folderName = paths[paths.length - 1];
        let folder = {
          path,
          name: folderName,
          metaData: {
            name: folderName,
            type: 'Folder',
            size: 0,
            location: (fileExplorerCtrl.rootFolder + fileExplorerCtrl.currentPath.map(c => c.rootName).join('/') + '/' + paths.join('/')).replace('//', '/'),
            author: window.localStorage.getItem('username'),
            uploaded: Date.now() + '',
            modified: Date.now() + '',
            source: 'Desktop Uploaded',
            block: '',
            field: '',
            well: '{}',
            welltype: '',
            datatype: '',
            quality: '5',
            relatesto: '{}',
            description: ''
          }
        };
        self.uploadFolderList.push(folder);
        file.folder = folder;
      }
      self.uploadFolderList.sort((a, b) => {
        return a.path.split('/').length - b.path.split('/').length;
      });
      console.log(self.uploadFolderList);
    };
    this.createFolder = function (cb) {
      self.processingFolder = true;
      async.eachSeries(self.uploadFolderList.filter(f => !f.isDone), (folder, next) => {
        if (!folder.ignoreWarning) {
          folder.warning = utils.checkMetadata(folder.metaData);
          if (folder.warning) {
            return next();
          }
        }
        for (let key in folder.metaData) {
          folder.metaData[key] = folder.metaData[key] + '';
        }
        const url = new URL(fileExplorerCtrl.newFolderUrl);
        url.searchParams.append('dest', folder.metaData.location.substring(0, folder.metaData.location.lastIndexOf('/')))
        url.searchParams.append('name', folder.name)
        url.searchParams.append('metaData', JSON.stringify(folder.metaData))

        fileExplorerCtrl.httpGet(url.toString(), res => {
          console.log(res);
          folder.isDone = true;
          next();
        }, { silent: true });
      }, (err) => {
          if (!err) self.processingFolder = false;
          cb(err);
      });
    };
    this.getExistedFiles = function () {
      if (!self.processing) return [];
      return self.uploadFileList.filter(f => f.existed && !f.overwrite);
    }
    this.getWarnings = function () {
      if (!self.processing) return [];
      return [...self.uploadFolderList, ...self.uploadFileList].filter(f => f.warning && !f.ignoreWarning);
    }
    this.overwriteAllFiles = function () {
      self.uploadFileList.map(file => { file.overwrite = true });
      self.uploadFiles();
    }
    this.overwriteFile = function (index) {
      if (_.isFinite(index)) {
        self.uploadFileList[index].overwrite = true;
        self.uploadFiles();
      }
    }
    this.ignoreWarning = function (index, type = 'file') {
      if (!_.isFinite(index)) return;
      if (type === 'file') {
        self.uploadFileList[index].ignoreWarning = true;
        self.uploadFiles();
      } else {
        self.uploadFolderList[index].ignoreWarning = true;
        self.uploadFiles();
      }
    }
    this.ignoreWarningAllFiles = function () {
      self.uploadFolderList.forEach(f => { f.ignoreWarning = true });
      self.uploadFileList.forEach(file => { file.ignoreWarning = true });
      self.uploadFiles();
    }
    this.cancelUpload = function () {
      self.uploadFileList.forEach(f => {
        f.warning = '';
      });
      self.processing = false;
      self.processingFolder = false;
      self.selectedFile = self.bakSelectedFile;
    }
    this.uploadFiles = function () {
      self.processing = true;
      self.bakSelectedFile = self.selectedFile;
      self.selectedFile = null;
      self.createFolder((err) => {
        if (err) return;
        async.each(self.uploadFileList, (file, next) => {
            if (file.uploadingProgress || (file.existed && !file.overwrite) || (file.warning && !file.ignoreWarning)) {
              next();
            } else {
              if (!file.ignoreWarning) {
                file.warning = utils.checkMetadata(file.metaData);
                if (file.warning) {
                  return next();
                }
              }
              let metaDataRequest = {};
              for (let key in file.metaData) {
                metaDataRequest[key] = file.metaData[key] + '';
              }
              fileExplorerCtrl.httpGet(fileExplorerCtrl.checkFileExistedUrl + encodeURIComponent(JSON.stringify(metaDataRequest)), result => {
                if (result.data.code === 409 && !file.overwrite) {
                  let index = self.uploadFileList.findIndex(f => _.isEqual(f, file));
                  self.uploadFileList[index].existed = true;
                  self.uploadFileList[index].uploadingProgress = null;
                  self.uploadFileList[index].overwrite = false;
                  next();
                } else {
                  if (result.data.code === 409) {
                    fileExplorerCtrl.httpPost(`${fileExplorerCtrl.previewUrl}/remove-file-in-cache`,
                      {item: file,
                       path: (fileExplorerCtrl.rootFolder + fileExplorerCtrl.currentPath.map(c => c.rootName).join('/') + file.desDirectory + '/' + file.name).replace('//', '/')},
                      result => {
                      //console.log(result.data)
                    }, {service: "WI_FILE_PREVIEW"})
                  }
                  if (self.processingName.findIndex(f => _.isEqual(f, file)) === -1) self.processingName.push(file);
                  self.uploadUrl = fileExplorerCtrl.uploadUrl + encodeURIComponent(fileExplorerCtrl.rootFolder + fileExplorerCtrl.currentPath.map(c => c.rootName).join('/') + file.desDirectory) + '&metaData=' + encodeURIComponent(JSON.stringify(metaDataRequest)) + '&overwrite=' + file.overwrite;
                  file.uploadingObject = Upload.upload({
                    url: self.uploadUrl,
                    headers: {
                      'Content-Type': 'application/json',
                      'Referrer-Policy': 'no-referrer',
                      'Authorization': window.localStorage.getItem('token'),
                      'Storage-Database': JSON.stringify(fileExplorerCtrl.storageDatabase),
                      'Service': "WI_PROJECT_STORAGE"
                    },
                    data: {
                      'upload-file': file
                    }
                  });
                  file.uploadingObject.then(resp => {
                    console.log(resp);
                    self.uploadFileList.splice(self.uploadFileList.findIndex(f => _.isEqual(f, file)), 1);
                    // console.log(resp);
                    next();
                  }, err => {
                    console.log('Error status: ' + err);
                  }, event => {
                    let percentage = event.loaded / event.total * 100;
                    if (event.type === "load") {
                      file.uploadingProgress.status = "Uploaded ...";
                      self.processingName.splice(self.processingName.findIndex(f => _.isEqual(f, file)), 1);
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
            if (!err && self.uploadFileList.length === 0 && !self.uploadFolderList.some(f => !f.isDone)) {
              fileExplorerCtrl.goTo(-999);
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
      // if(self.typeSelect === 'file') uploadList = self.uploadFileList;
      // if(self.typeSelect === 'folder') uploadList = self.uploadFolderList;
      uploadList = self.uploadFileList.concat(self.uploadFolderList);
      uploadList.forEach(file => {
        file.metaData = Object.assign(file.metaData, metaData);
      });
    };
    self.addMetadata = function () {
      self.metaData4All.moreInfo[''] = '';
    };
    this.typeSelect = 'file';
    self.selectRow = function(uploadRow, index, type) {
      self.typeSelect = type;
      self.selectedFile = uploadRow;
    }
    /*self.selectFile = function (uploadFile, index) {
      self.selectedFile = uploadFile;
      console.log("Doi ne ", self.selectedFile);
    };

    self.selectFolder = function (uploadFolder, index) {
      self.selectedFolder = uploadFolder;
      console.log("Doi ne ", self.selectedFolder);
    };*/

    this.closeModal = function () {
      this.removeAll();
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
