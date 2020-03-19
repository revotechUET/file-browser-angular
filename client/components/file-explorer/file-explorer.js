// Load css
require('./new-file-explorer.less');

// Load js
/*
require('../../vendor/js/ng-file-upload.min');
const async = require('../../vendor/js/async.min');
*/


// const crypto = require('crypto');
const textViewer = require('../text-viewer/text-viewer').name;
const pdfViewer = require('../pdf-viewer/pdf-viewer').name;
// const imgPreview = require('../img-preview/img-preview').name;
const imgPreview = 'img-preview'
const storageProps = require('../storage-props/storage-props').name;
// const textViewerDialog = require('../../dialogs/text-viewer/text-viewer-modal');
const pdfViewerDialog = require('../../dialogs/pdf-viewer/pdf-viewer-modal');
const uploadFileDialog = require('../../dialogs/upload-files/upload-files-modal');
const newFolderDialog = require('../../dialogs/new-folder/new-folder-modal');
const newAdvancedSearchDialog = require('../../dialogs/new-advanced-search/advanced-search-modal');
const bulkEditDialog = require('../../dialogs/bulk-edit/bulk-edit-modal');
const confirmDialog = require('../../dialogs/confirm/confirm-modal');

const utils = require('../../js/utils');
const getFileExtension = utils.getFileExtension;


const moduleName = 'file-explorer';
const componentName = 'fileExplorer';

// var miscComponent = require('misc-component');
// const ALGORITHM = 'aes-256-cbc';
// const SECRET_KEY = 'secretKey';
// const HEADER_CONFIG = {
//   'Content-Type': 'application/json',
//   'Referrer-Policy': 'no-referrer',
//   'Authorization': window.localStorage.getItem('token'),
//   'Storage-Database': window.localStorage.getItem('storage_database')
// };
const RAW_DATA_PATH = '/read-file/preview?file_path=';
const EXPLORE_PATH = '/file-explorer/shallow?dir=';
const UPLOAD_PATH = '/upload?location=';
const DOWNLOAD_PATH = '/download?file_path=';
const DOWNLOAD_PATH_POST = '/download';
const REMOVE_PATH = '/action/remove?file_path=';
const COPY_PATH = '/action/copy?';
const MOVE_PATH = '/action/move?';
const NEW_FOLDER_PATH = '/action/create-folder?';
const SEARCH_PATH = '/search';
const UPDATE_META_DATA = '/action/update-meta-data';
const CHECK_OBJECT_EXISTS = '/upload/is-existed?metaData=';
const RESTORE_REVISION = '/action/restore';
const REMOVE_REVISION = '/action/remove-revision';
const UPLOAD_FILES = '/upload/lases';
const UPLOAD_DLIS = '/upload/dlis';
const SUBMIT_TO_COMPANY_DB = '/submit/submit-files';
const PROCESSING_STATUS = '/action/status?key=';
const CANCEL_PROCESS = '/action/cancel?key=';
Controller.$inject = ['$scope', '$timeout', '$filter', '$element', '$http', 'ModalService', 'Upload', 'wiSession', 'wiApi', 'wiDialog'];

function Controller($scope, $timeout, $filter, $element, $http, ModalService, Upload, wiSession, wiApi, wiDialog) {
  let self = this;
  let _toastr = window.__toastr || window.toastr;
  window.fileBrowser = self;
  self.widthArray = [];
  self.headerArray = ['Name', 'CODB Status', 'Data type', 'Size', 'Data modified'];
  self.fileTypeList = [
    {
      type: 'svg',
      class: 'svg-icon-16x16'
    },
    {
      type: 'json',
      class: 'json-icon-16x16'
    }, {
      type: 'html',
      class: 'json-icon-16x16'
    }, 
    {
      type: 'htm',
      class: 'json-icon-16x16'
    },
    {
      type: 'py',
      class: 'json-icon-16x16'
    },
    {
      type: 'bmp',
      class: 'jpg-icon-16x16'
    }, {
      type: 'tif',
      class: 'jpg-icon-16x16'
    },
    {
      type: 'tiff',
      class: 'jpg-icon-16x16'
    },
    {
      type: 'csv',
      class: 'csv-icon-16x16'
    }, 
    {
      type: 'jpg',
      class: 'jpg-icon-16x16'
    }, 
    {
      type: 'jpeg',
      class: 'jpg-icon-16x16'
    }, 
    {
      type: 'png',
      class: 'jpg-icon-16x16'
    }, {
      type: 'doc',
      class: 'docx-icon-16x16'
    },
    {
      type: 'docx',
      class: 'docx-icon-16x16'
    },
    {
      type: 'docm',
      class: 'docx-icon-16x16'
    },
    {
      type: 'xls',
      class: 'xlsx-icon-16x16'
    },
    {
      type: 'xlsx',
      class: 'xlsx-icon-16x16'
    },
    {
      type: 'xlsm',
      class: 'xlsx-icon-16x16'
    },
    {
      type: 'xlt',
      class: 'xlsx-icon-16x16'
    },
    {
      type: 'xltm',
      class: 'xlsx-icon-16x16'
    },
    {
      type: 'xltx',
      class: 'xlsx-icon-16x16'
    },
    {
      type: 'ppt',
      class: 'pptx-icon-16x16'
    },
    {
      type: 'pptm',
      class: 'pptx-icon-16x16'
    },
    {
      type: 'pptx',
      class: 'pptx-icon-16x16'
    },
    {
      type: 'ppsx',
      class: 'pptx-icon-16x16'
    },
    {
      type: 'ppsm',
      class: 'pptx-icon-16x16'
    },
    {
      type: 'pdf',
      class: 'pdf-icon-16x16'
    }, {
      type: 'zip',
      class: 'zip-icon-16x16'
    }, {
      type: 'rar',
      class: 'zip-icon-16x16'
    }, {
      type: 'txt',
      class: 'file-icon-16x16'
    }, {
      type: 'Unknown',
      class: 'file-icon-16x16'
    }
  ]
  this.wiSession = wiSession;
  this.$onInit = function () {
    if(typeof self.setContainer === 'function') self.setContainer(self);

    self.imgResource = {};
    self.currentPath = [];
    self.selectedList = [];
    self.selectedItem = {};
    self.pasteList = [];
    self.requesting = false;
    self.rootFolder = self.rootFolder || '/';
    self.filter = '';
    self.propOrder = 'rootName';
    self.reverse = false;
    // self.HEADER_CONFIG = HEADER_CONFIG;

    self.rawDataUrl = self.url + RAW_DATA_PATH;
    self.exploreUrl = self.url + EXPLORE_PATH;
    self.uploadUrl = self.url + UPLOAD_PATH;
    self.downloadUrl = self.url + DOWNLOAD_PATH;
    self.removeUrl = self.url + REMOVE_PATH;
    self.copyUrl = self.url + COPY_PATH;
    self.moveUrl = self.url + MOVE_PATH;
    self.newFolderUrl = self.url + NEW_FOLDER_PATH;
    self.searchUrl = self.url + SEARCH_PATH;
    self.updateMetaDataUrl = self.url + UPDATE_META_DATA;
    self.checkFileExistedUrl = self.url + CHECK_OBJECT_EXISTS;
    self.restoreRevisionUrl = self.url + RESTORE_REVISION;
    self.removeRevisionUrl = self.url + REMOVE_REVISION;
    self.submitToCompanyDatabaseUrl = self.url + SUBMIT_TO_COMPANY_DB;
    self.statusUrl = self.url + PROCESSING_STATUS;
    self.cancelUrl = self.url + CANCEL_PROCESS;
    self.checkPermissionUrl = self.url + '/action/get-permission?permission=';
    self.modeFilter = 'all';
    let searchQuery = {
      conditions: {
        operator: "and",
        children: [
          {
            operator: "or",
            children: [
              {name: ""}
            ]
          }
        ]
      },
      type: "all",
      subFolders: "included"
    }
    self.searchQuery = searchQuery;
    $scope.$watch(() => self.storageDatabase, () => {
      if (self.storageDatabase) {
        if (self.linkedFile) {
          //self.goToByPath(self.linkedFile);
        } else {
          self.httpGet(self.exploreUrl + encodeURIComponent(self.rootFolder), result => {
            if (result) {
              const data = result.data.data;
              self.fileList = [...data.files, ...data.folders];
            }
          });
        }
        self.processingKey = 'PROCESSING-' + self.storageDatabase.directory;
        self.processing = JSON.parse(localStorage.getItem(self.processingKey)) || [];
      } else {
        self.fileList = [];
      }
    });

    // processing status
    const refreshDebounced = _.debounce(() => self.goTo(-999), 1000);
    let updating = false;
    const updateProcessing = _.debounce(function () {
      if (updating || !self.processing || !self.processing.length) {
        return;
      }
      updating = true;
      async.each(self.processing, function (item, next) {
        if (item.status === 'SUCCESS' || item.status === 'ERROR') {
          return next();
        }
        self.httpGet(self.statusUrl + item.key, function (res, err) {
          if (err) {
            // network error, retry
            return next();
          }
          const data = res.data;
          if (data.error) {
            item.percentage = 100;
            item.status = 'SUCCESS';
          } else {
            Object.assign(item, data, {
              percentage: data.info * 100,
            });
            if (item.status === 'SUCCESS') {
              refreshDebounced();
            }
          }
          next();
        }, { silent: true });
      }, function () {
        updating = false;
        self.processing = self.processing.filter(i => i.status !== 'SUCCESS');
        localStorage.setItem(self.processingKey, JSON.stringify(self.processing));
        updateProcessing();
      });
    }, 2000)
    $scope.$watchCollection(() => self.processing, updateProcessing);
    const $processing = $element.find('.toolbar .processing');
    const $listProcessing = $processing.find('.list');
    $processing.focus(function () {
      const { top, height } = this.getBoundingClientRect();
      $listProcessing.css({ width: this.clientWidth, top: top + height - 1 });
      $listProcessing.fadeIn(300);
    });
    $processing.blur(() => $listProcessing.fadeOut(300));
  };
  this.submitToCompanyDatabase = function (files) {
    files = files.map(f => f.path);
    self.httpPost(self.submitToCompanyDatabaseUrl, {file_paths: files, project: window.localStorage.getItem('LProject')}, res => {
      self.goTo(-999)
    })
  };
  this.removeRevision = function (revision) {
    let url = self.removeRevisionUrl + '?file_path=' + encodeURIComponent(self.selectedItem.path) + '&revision=' + revision.name;
    self.httpGet(url, function (rs) {
      self.goTo(-999)
    })
  };
  this.restoreVersion = function (revision) {
    let url = self.restoreRevisionUrl + '?file_path=' + encodeURIComponent(self.selectedItem.path) + '&revision=' + revision.name;
    self.httpGet(url, function (rs) {
      self.goTo(-999)
    })
  };
  this.setIconFile = function (name) {
    let found = self.fileTypeList.find(f => f.type === getFileExtension(name))
    return found ? found.class : "file-icon-16x16";
  }
  this.changeWidth = function (leftColIdx, leftColWidth, rightColIdx, rightColWidth) {
    $timeout(() => {
      self.widthArray[leftColIdx] = leftColWidth;
      self.widthArray[rightColIdx] = rightColWidth;
    });
  }
  this.tableInit = function (tableWidthArray) {
    $timeout(() => {
      self.widthArray = tableWidthArray;
    });
  }

  this.orderBy = function (propOrder) {
    self.reverse = (self.propOrder === propOrder) ? !self.reverse : false;
    self.propOrder = propOrder;
  };

  this.isSelected = function (item) {
    return self.selectedList.indexOf(item) !== -1;
  };

  function getFileListOrder(fileList, propOrder, reverse) {
    if (!fileList) return;
    let orderBy = $filter('orderBy');
    return orderBy(fileList, propOrder, reverse);
  };
  this.clickNode = function (item, $event) {
    if (self.selectedItem !== item) {
      self.selectedItem = item;
      //console.log('selectedItem: ', self.selectedItem);
      $scope.addName = '';
      $scope.addValue = '';
    }
    self.selectedItem.metaData.modified = new Date(self.selectedItem.modifiedDate).getTime() + '';
    let indexInSelectedList = self.selectedList.indexOf(item);

    if ($event && $event.shiftKey) {
      let list = getFileListOrder(self.fileList, self.propOrder, self.reverse);
      let indexInList = list.indexOf(item);
      let lastSelected = self.selectedList[0];
      let i = list.indexOf(lastSelected);
      let current = undefined;
      if (lastSelected && list.indexOf(lastSelected) < indexInList) {
        self.selectedList = [];
        while (i <= indexInList) {
          current = list[i];
          !self.isSelected(current) && self.selectedList.push(current);
          i++;
        }
        console.log("===", self.selectedList);
        return;
      }
      if (lastSelected && list.indexOf(lastSelected) > indexInList) {
        $scope.temps = [];
        while (i >= indexInList) {
          current = list[i];
          !self.isSelected(current) && self.selectedList.push(current);
          i--;
        }
        console.log("===", self.selectedList);
        return;
      }
    }
    if ($event && $event.ctrlKey) {
      self.isSelected(item) ? self.selectedList.splice(indexInSelectedList, 1) : self.selectedList.push(item);
      console.log("===", self.selectedList);
      return;
    }
    self.selectedList = [item];
    self.clickNodeFn && self.clickNodeFn(self.selectedList);
  };

  this.dblClickNode = function (item) {
    if (!item)
      return;
    if (!item.rootIsFile) {
      self.selectedList = [];
      self.httpGet(self.exploreUrl + encodeURIComponent(item.path), result => {
        let data = result.data.data;
        self.fileList = [...data.files, ...data.folders];
        self.currentPath.length = 0;
        item.path.slice(1, item.path.length - 1).split("/").map((name, idx) => {
          self.currentPath.push({rootName: name, displayName: name});
        })
        //self.currentPath.push({rootName: item.rootName, displayName: item.displayName});
        self.filter = '';
        self.modeFilter = 'all';
      })
    } else {
      if (self.disablePreview) return;
      self.filter = '';
      // self.modeFilter = 'all';
      self.selectedList.push(item);
      self.httpPost(`${self.previewUrl}/check-in-cache?file_path=${encodeURIComponent(item.path)}`,
        {item}, result => {
          if (result.data.notCached) {
            _toastr ? _toastr.info(`File is being converted for next fast preview`)
              : console.info(`File is being converted for next fast preview`);
          }
          self.httpPost(`${self.previewUrl}/filepreview?file_path=${encodeURIComponent(item.path)}`,
            {item}, result => {
              if (result.data.isNotReadable) {
                _toastr ? _toastr.error(`Previewing "${item.rootName}" is not available`)
                  : console.error(`Previewing "${item.rootName}" is not available`);
              } else {
                if (result.data.isTooBig) {
                  _toastr ? _toastr.error(`"${item.rootName}" exceeds the maximum file size that we can preview`)
                    : console.error(`"${item.rootName}" exceeds the maximum file size that we can preview`);
                } else {
                  let data = {title: item.rootName};
                  data.fileContent = result.data;
                  pdfViewerDialog(ModalService, self, data, item);

                  // data.fileContent = resource;
                  // switch (true) {
                  //     case !resource.isReadable:
                  //         console.log("Can't preview this file");
                  //         data.fileContent = "No preview available";
                  //         textViewerDialog(ModalService, self, data, item);
                  //         // self.downloadFile(item);
                  //         break;
                  //     case /\.pdf$/.test(self.getExtFile(item)):
                  //         data.fileContent = resource.base64;
                  //         pdfViewerDialog(ModalService, self, data, item);
                  //         break;
                  //     case /\.(jpg|JPG|png|PNG|jpeg|JPEG|gif|GIF|bmp|BMP|svg|SVG)$/.test(self.getExtFile(item)):
                  //         self.imgResource.title = item.rootName;
                  //         self.imgResource.fileContent = resource.base64;
                  //         let imgCtnElm = document.getElementById('img-container');
                  //         self.imgResource.parentElem = imgCtnElm;
                  //         imgCtnElm.style.display = 'block';
                  //         break;
                  //     default:
                  //         data.fileContent = resource.utf8;
                  //         textViewerDialog(ModalService, self, data, item);
                  // }
                }
              }
            }, {service: "WI_FILE_PREVIEW"})
        }, {service: "WI_FILE_PREVIEW"})
    }
  };

  this.getDownloadLink = function (items) {
    if (items.length > 1) return '';
    let item = Array.isArray(items) ? items[0] : items;
    if (!item || !item.rootIsFile)
      return '';

    return self.downloadUrl + encodeURIComponent(item.path) + `&token=${window.localStorage.getItem('token')}&storage_database=${JSON.stringify(self.storageDatabase)}`;
  }

  this.getDownloadFileName = function (items) {
    if (items.length > 1) return '';
    let item = Array.isArray(items) ? items[0] : items;
    if (!item || !item.rootIsFile)
      return '';

    return item.rootName || 'untitled';
  }

  this.downloadFile = async function (items) {
    if (items.length === 0) return;
    if (this.checkPermission) {
      const res = await new Promise(resolve => this.httpGet(self.checkPermissionUrl + 'download', resolve));
      if (res.data.error) return;
    }
    self.requesting = true;
    // // let item = Array.isArray(items) ? items[0] : items;
    // // if (!item || !item.rootIsFile)
    // //     return;
    //
    // const a = document.createElement('a');
    // a.download = item.rootName || 'untitled';
    // a.href = self.downloadUrl + encodeURIComponent(item.path) + `&token=${window.localStorage.getItem('token')}&storage_database=${JSON.stringify(self.storageDatabase)}`;
    // a.style.display = 'none';
    // document.body.appendChild(a);
    // a.click();
    // a.parentNode.removeChild(a);
    let downloadFiles = items.map((item) => {
      if (item.rootIsFile) {
        return item.path
      } else {
        return item.path + '/'
      }
    });

    $http({
      url: self.url + DOWNLOAD_PATH_POST,
      method: 'POST',
      headers: {
        'Authorization': window.localStorage.getItem('token'),
        'Storage-Database': JSON.stringify(self.storageDatabase),
        'Content-Type': 'application/json',
        'Referrer-Policy': 'no-referrer',
        'Service': 'WI_PROJECT_STORAGE'
      },
      data: {
        // 'files': ["/I2G/aa8f3445dd87fb273dfc4f862ee8b917f2de1088/01-97-Ho Xam-1X.las"]
        'files': downloadFiles
      },
      responseType: 'arraybuffer',
    }).then(response => {
      let blob = new Blob([response.data], {
        type: 'application/octet-stream'
      });
      let a = document.createElement('a');
      let fileName = "I2G_Download_" + Date.now() + '_' + Math.floor(Math.random() * 100000) + '.zip';
      console.log(fileName);
      a.download = response.headers('File-Name') || response.headers('file-name') || response.headers('filename') || fileName;
      // a.download = fileName;
      a.href = URL.createObjectURL(blob);
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      a.parentNode.removeChild(a);
      self.requesting = false;
      // check for a filename
      // let filename = Date.now() + '_' + Math.floor(Math.random() * 100000) + '.zip';
      // // let fileName = xhr.getResponseHeader('File-Name');
      // // let disposition = xhr.getResponseHeader('Content-Disposition');
      // // if (disposition && disposition.indexOf('attachment') !== -1) {
      // //     let filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      // //     let matches = filenameRegex.exec(disposition);
      // //     if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
      // // }
      //
      // let type = xhr.getResponseHeader('Content-Type');
      // let blob = new Blob([response], {type: 'application/zip'});
      //
      // if (typeof window.navigator.msSaveBlob !== 'undefined') {
      //     // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
      //     window.navigator.msSaveBlob(blob, filename);
      // } else {
      //     let URL = window.URL || window.webkitURL;
      //     let downloadUrl = URL.createObjectURL(blob);
      //
      //     if (filename) {
      //         // use HTML5 a[download] attribute to specify filename
      //         let a = document.createElement("a");
      //         // safari doesn't support this yet
      //         if (typeof a.download === 'undefined') {
      //             window.location = downloadUrl;
      //         } else {
      //             a.href = downloadUrl;
      //             a.download = filename;
      //             document.body.appendChild(a);
      //             a.click();
      //         }
      //     }
      //
      //     setTimeout(function () {
      //         URL.revokeObjectURL(downloadUrl);
      //     }, 100); // cleanup
      // }
      // setTimeout(function(){
      //     document.body.removeChild(anchor);
      //     url.revokeObjectURL(anchor.href);
      // }, 1};
    })
    .catch(err => {
      console.error("file browser error", err);
      if (err.data.code === 401) location.reload();
    });
  };
  this.goToByPath = function (path) {
    if (!path) return;
    let children = [];
    if (typeof path === 'string') children = [{location: path}];
    if (Array.isArray(path)) {
      let pathsCP = angular.copy(path);
      _.remove(pathsCP, t => !t);
      children = pathsCP.map(p => {
        return {location: p}
      });
    }
    let searchPayload = {
      content: {
        subFolders: 'included',
        type: 'all',
        conditions: {
          operator: 'or',
          children: children
        }
      },
      folder: '/'
    }
    self.httpPost(self.searchUrl, searchPayload, res => {
      self.fileList = res.data.data;
      self.modeFilter = 'related';
    });
  }
  this.goTo = function (index, callback) {
    if (index == '-999') {
      self.httpGet(self.exploreUrl + encodeURIComponent(self.rootFolder + self.currentPath.map(c => c.rootName).join('/')), result => {
        let data = result.data.data;
        self.fileList = [...data.files, ...data.folders];
        callback && callback(self.fileList);
      })
      self.httpGet(`${self.previewUrl}/refresh-cache`, result => {
        //console.log(result.data)
      }, {service: "WI_FILE_PREVIEW"})
    } else {
      self.selectedList = [];
      self.currentPath = self.currentPath.slice(0, index + 1);
      let newPath = self.rootFolder + self.currentPath.map(c => c.rootName).join('/');
      self.httpGet(self.exploreUrl + encodeURIComponent(newPath), result => {
        let data = result.data.data;
        self.fileList = [...data.files, ...data.folders];
        callback && callback(self.fileList);
      })
    }
  };


  this.removeNodes = function () {
    if (!self.selectedList)
      return;
    let mess = "Are you sure you want to delete " + (self.selectedList.length > 1 ? self.selectedList.length + ' items?' : ' this item?');
    confirmDialog(ModalService, "Delete Confirmation", mess, function (ret) {
      if (ret) {
        async.each(self.selectedList, (node, next) => {
          self.httpGet(self.removeUrl + encodeURIComponent(node.path), result => {
            console.log(result);
            next();
          })
        }, err => {
          if (!err) {
            self.goTo(self.currentPath.length - 1);
          }
        })
      }
    });
  };
  this.bulkEdit = function (items) {
    bulkEditDialog(ModalService, function (res) {
      if (res) {
        items.forEach(item => {
          item.metaData = Object.assign(item.metaData, res);
          self.saveObject({
            key: item.rootIsFile ? item.path : item.path + '/',
            metaData: item.metaData
          });
        })
      }
    });
  }
  this.copyMultiLocation = function (items) {
    let locations = items.map(item => item.metaData.location);
    wiSession.putData('location', JSON.stringify({option: 'multi', value: locations}));
  }
  this.multiLocationCopied = function (items) {
    let locations = JSON.parse(wiSession.getData('location'));
    let _locations = items.map(item => item.metaData.location);
    if(locations && locations.value && locations.value.length == _locations.length
        && !locations.value.some(l => !_locations.includes(l))) return true;
		else return false;
  }
  this.paste = function () {
    if (!(self.pasteList))
      return;
    switch (self.pasteList.action) {
      case 'copy':
        async.eachSeries(self.pasteList, (file, next) => {
          let from = `from=${encodeURIComponent(file.path)}&`;
          let dest = `dest=${encodeURIComponent(self.rootFolder + self.currentPath.map(c => c.rootName).join('/'))}`;

          self.httpGet(`${self.copyUrl + from + dest}`, res => {
            if (!res.data.error && res.data.status === 'IN_PROGRESS') {
              self.addProcessing(res.data);
            }
            next();
          })
        }, err => {
          if (err) {
            console.log(err);
          } else {
            console.log('===done');
          }
          self.goTo(self.currentPath.length - 1);
        });
        break;
      case 'cut':
        async.eachSeries(self.pasteList, (file, next) => {
          let from = `from=${encodeURIComponent(file.path)}&`;
          let dest = `dest=${encodeURIComponent(self.rootFolder + self.currentPath.map(c => c.rootName).join('/'))}`;

          self.httpGet(`${self.moveUrl + from + dest}`, res => {
            if (!res.data.error && res.data.status === 'IN_PROGRESS') {
              self.addProcessing(res.data);
            }
            next();
          })
        }, err => {
          if (err) {
            console.log(err);
          } else {
            console.log('=done');
          }
          self.goTo(self.currentPath.length - 1);
        });
        break;
    }
  };

  this.copyOrCut = function (action) {
    if (!self.selectedList)
      return;
    self.pasteList = self.selectedList;
    self.pasteList.action = action;
  };

  this.addProcessing = function (processing) {
    if (self.processing.find(i => i.key === processing.key)) {
      return;
    }
    processing.percentage = 0;
    processing.fromName = processing.data.from.split('/').slice(-1)[0] || processing.data.from.split('/').slice(-2)[0];
    processing.destName = processing.data.dest.split('/').slice(-1)[0] || 'Home';
    self.processing.push(processing);
  }

  this.removeProcessing = function (item) {
    self.httpGet(self.cancelUrl + item.key, function (res, err) {
      if (err) {
        console.log("Error while cancel ", err);
      } else {
        console.log("Cancel process");
        self.processing = self.processing.filter(i => i !== item);
      }
    });
  };

  this.uploadFiles = async function () {
    if (this.checkPermission) {
      const res = await new Promise(resolve => this.httpGet(self.checkPermissionUrl + 'upload', resolve));
      if (res.data.error) return;
    }
    uploadFileDialog(ModalService, Upload, self);
  };

  this.newFolder = async function () {
    if (this.checkPermission) {
      const res = await new Promise(resolve => this.httpGet(self.checkPermissionUrl + 'upload', resolve));
      if (res.data.error) return;
    }
    newFolderDialog(ModalService, self);
  };

  this.search = function () {
    self.searchQuery = {
      conditions: {
        operator: "and",
        children: [
          {
            operator: "or",
            children: [
              {name: ""}
            ]
          }
        ]
      },
      type: "all",
      subFolders: "included"
    };
    if (self.filter != '') {
      let folder = `folder=${encodeURIComponent(self.rootFolder + self.currentPath.map(c => c.rootName).join('/'))}&`;
      let content = `content=${encodeURIComponent(self.filter)}`;

      // self.httpGet(`${self.searchUrl + folder + content}`, res => {
      //   self.fileList = res.data.data;
      // })
      let payload = {
        folder: self.rootFolder + self.currentPath.map(c => c.rootName).join('/'),
        content: {
          conditions: {
            children: [{name: self.filter}],
            operator: "or"
          },
          type: "all",
          subFolders: "included",
        }
      };
      self.httpPost(self.searchUrl, payload, res => {
        self.fileList = res.data.data;
        self.modeFilter = 'seach';
      });
    } else if (!self.filter || self.filter === '') {
      self.modeFilter = 'all';
      self.goTo(-999);
    } else if (self.filter != '[Custom search]') self.goTo(self.currentPath.length - 1);
  }
  this.advancedSearch = function () {
    newAdvancedSearchDialog(ModalService, self, function (isSearching) {
      if (isSearching) {
        self.modeFilter = 'custom search';
        self.filter = '[Custom search]';
        let folder = `folder=${encodeURIComponent(self.rootFolder + self.currentPath.map(c => c.rootName).join('/'))}&`;

        let payload = {
          folder: self.rootFolder + self.currentPath.map(c => c.rootName).join('/'),
          content: self.searchQuery
        };
        self.httpPost(self.searchUrl, payload, res => {
          self.fileList = res.data.data;
        });
      }
    });
  }
  this.httpGet = function (url, cb, options = {}) {
    if (!options.silent) {
      self.requesting = true;
    }
    let reqOptions = {
      method: 'GET',
      url: url,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'http://127.0.0.1:5000',
        'Access-Control-Allow-Credentials': 'true',
        'Referrer-Policy': 'no-referrer',
        'Authorization': window.localStorage.getItem('token'),
        'Storage-Database': JSON.stringify(self.storageDatabase),
        'Service': (options || {}).service || 'WI_PROJECT_STORAGE'
      }
    };
    $http(reqOptions).then(result => {
      if (!options.silent) {
        self.requesting = false;
        if (result.data && result.data.error) {
          toastr.error(result.data.message);
        }
      }
      cb(result);
    }, err => {
      console.error("file browser error", err);
      if (err.data.code === 401) location.reload();
      if (!options.silent) {
        self.requesting = false;
      }
      console.log(err);
      cb(null, err);
    });
  };

  this.httpPost = function (url, payload, cb, options = {}) {
    if (!options.silent) {
      self.requesting = true;
    }
    //self.requesting = !self.requesting;
    let reqOptions = {
      method: 'POST',
      url: url,
      headers: {
        'Content-Type': 'application/json',
        'Referrer-Policy': 'no-referrer',
        'Authorization': window.localStorage.getItem('token'),
        'Storage-Database': JSON.stringify(self.storageDatabase),
        'Service': (options || {}).service || 'WI_PROJECT_STORAGE'
      },
      data: payload
    };
    $http(reqOptions).then(result => {
      if (!options.silent) {
        self.requesting = false;
        if (result.data && result.data.error) {
          toastr.error(result.data.message);
        }
      }
      cb(result);
    }, err => {
      console.error("file browser request", err);
      if (!options.silent) {
        self.requesting = false;
      }
      console.log(err);
    })
  };

  this.getExtFile = function (item) {
    if (!item.rootIsFile)
      return '';
    let arr = item.rootName.split('.');
    return '.' + arr[arr.length - 1];
  };

  // function encrypt(text) {
  //     var cipher = crypto.createCipher(ALGORITHM, SECRET_KEY)
  //     var crypted = cipher.update(text, 'utf8', 'hex')
  //     crypted += cipher.final('hex');
  //     return crypted;
  // }
  this.saveObject = function (payload, cb) {
    if (typeof(payload.metaData.name) == 'string' && !utils.validateNodeName(payload.metaData.name)) {
        toastr.error("a file/folder can't contain any of the following characters / \\ : * ? \" < > | ");
        self.goTo(-999);
        return;
    }

    self.httpPost(self.updateMetaDataUrl, payload, (res) => {
      cb && cb(res.data);
      /*self.goTo(-999, function(fileList) {
              cb && cb(fileList);
            });*/
    });
  };
  this.updateMetaData = function (metaData) {
    self.selectedItem.metaData = metaData;
    self.saveObject({
      key: self.selectedItem.rootIsFile ? self.selectedItem.path : self.selectedItem.path + '/',
      metaData: metaData
    }, function (res) {
      if (!res.error) {
        self.selectedItem.rootName = metaData.name;
      }
      self.goTo(-999, (fileList) => {
        let item = fileList.find(f => f.rootName === self.selectedItem.rootName);
        self.clickNode(item);
      })
    });
  };
  this.removeMetaData = function (name) {
    console.log("remove", name);
    delete self.selectedItem.metaData[name];
    self.saveObject({
      key: self.selectedItem.rootIsFile ? self.selectedItem.path : self.selectedItem.path + '/',
      metaData: self.selectedItem.metaData
    });
    self.goTo(-999)
  };
  this.addMetaData = function (name, value) {
    console.log("add", name, value);
    console.log("item", self.selectedItem);
    if (!name || !value || name === "" || value === "") return;
    self.selectedItem.metaData[name] = value;
    self.saveObject({
      key: self.selectedItem.rootIsFile ? self.selectedItem.path : self.selectedItem.path + '/',
      metaData: self.selectedItem.metaData
    });
    $scope.addName = "";
    $scope.addValue = "";
  }
  this.allFilesMode = function () {
    if (self.modeFilter !== 'all') {
      self.goTo(-999, function () {
        self.modeFilter = 'all';
        self.filter = '';
      });
    }
  }
  this.$onDestroy = function () {
    delete window.fileBrowser;

  }
  this.importCSV = function(items) {
    wiDialog.csvImportDialog();
  }
  // this.importFilesToInventory = function(items) {
  //   if (items.length === 0) return;
  //   self.requesting = true;
  //   if(items.length == 1) {
  //     if(items[0].rootName.split('.').length > 1 && (items[0].rootName.split('.').pop() == 'las' || items[0].rootName.split('.').pop() == 'dlis' || items[0].rootName.split('.').pop() == 'csv')) {
  //       downloadFileToUpload(items[0]);
  //     }else {
  //       self.requesting = false;
  //       __toastr.error("Only accept file las, dlis, csv", "Error");
  //     }
  //   }else {
  //     let isAllLas = true;
  //     for(let i in items) {
  //       if(items[i].rootName.split('.').length > 1 && items[i].rootName.split('.').pop() != 'las') {
  //         isAllLas = false;
  //         break;
  //       }
  //     }
  //     if(isAllLas) {
  //       items.forEach(item => {
  //         downloadFileToUpload(item);
  //       });
  //     }else {
  //       self.requesting = false;
  //       __toastr.error("Only accept multiple file las", "Error");
  //     }
  //   }
  // }
  this.importFilesToInventory = function(items) {
      if (items.length === 0) return;
      self.requesting = true;
      if(items.length == 1) {
        if(items[0].rootName.split('.').length > 1 && (items[0].rootName.split('.').pop() == 'las' || items[0].rootName.split('.').pop() == 'dlis' || items[0].rootName.split('.').pop() == 'csv')) {
          importCurves(items[0]);
        }else {
          self.requesting = false;
          __toastr.error("Only accept file las, dlis, csv", "Error");
        }
      }else {
        let isAllLas = true;
        for(let i in items) {
          if(items[i].rootName.split('.').length > 1 && items[i].rootName.split('.').pop() != 'las') {
            isAllLas = false;
            break;
          }
        }
        if(isAllLas) {
          items.forEach(item => {
            importCurves(item);
          });
        }else {
          self.requesting = false;
          __toastr.error("Only accept multiple file las", "Error");
        }
      }
  }
  function importCurves(fileToDownload) {
    downloadFileToUpload(fileToDownload)
    .then((file) => {
      if(file.name.split('.').length > 1) {
          switch(file.name.split('.').pop()) {
            case 'las': wiApi.uploadFilesToInventory({ file: [file], override: true }, callbackImportLAS, UPLOAD_FILES, { silent: true });
              break;
            case 'dlis': wiApi.uploadFilesToInventory({ file: [file], override: true }, callbackImportDLIS, UPLOAD_DLIS, { silent: true });
              break;
            case 'csv': wiDialog.csvImportDialog(file);
              break;
            default: break;
          }
        }
    })
    .catch((err) => {
      __toastr.error("Something went wrong", "Error");
    });
  }
  this.importZoneSet = function(items) {
    if(items.length === 0 ) return;
    self.requesting = true;
    downloadFileToUpload(items[0])
    .then(file => {
      if(file.name.split('.').length > 1 && file.name.split('.').pop() === 'csv') {
        self.requesting = true;
        wiDialog.importZoneSet(file, self.idProject, callBackImport);
      }else {
        __toastr.error("Only accept file csv", "Error");
      }
    });
    console.log("import zone set");
  } 
  this.importMarkerSet = function(items) {
    if(items.length === 0 ) return;
    self.requesting = true;
    downloadFileToUpload(items[0])
    .then(file => {
      if(file.name.split('.').length > 1 && file.name.split('.').pop() === 'csv') {
        self.requesting = true;
        wiDialog.importMarkerSet(file, self.idProject, callBackImport);
      }else {
        __toastr.error("Only accept file csv", "Error");
      }
    });
    console.log("import marker set");
  } 
  function callBackImport(data) {
    self.requesting = false;
    console.log(data);
  } 
  // function downloadFileToUpload(item) {
  //   $http({
  //     url: self.url + DOWNLOAD_PATH_POST,
  //     method: 'POST',
  //     headers: {
  //       'Authorization': window.localStorage.getItem('token'),
  //       'Storage-Database': JSON.stringify(self.storageDatabase),
  //       'Content-Type': 'application/json',
  //       'Referrer-Policy': 'no-referrer',
  //       'Service': 'WI_PROJECT_STORAGE'
  //     },
  //     data: {
  //       'files': [item.rootIsFile ? item.path : item.path + '/'],
  //       'skipCompressFile': "true"
  //     },
  //     responseType: 'arraybuffer',
  //   }).then(response => {
  //     let file = new Blob([response.data], {
  //       type: 'file'
  //     });
  //     self.requesting = false;
  //     file.name = item.rootName;
  //     if(file.name.split('.').length > 1) {
  //       switch(file.name.split('.').pop()) {
  //         case 'las': wiApi.uploadFilesToInventory({ file: [file], override: true }, callbackImportLAS, UPLOAD_FILES, { silent: true });
  //           break;
  //         case 'dlis': wiApi.uploadFilesToInventory({ file: [file], override: true }, callbackImportDLIS, UPLOAD_DLIS, { silent: true });
  //           break;
  //         case 'csv': wiDialog.csvImportDialog(file);
  //           break;
  //         default: break;
  //       }
  //     }
  //   })
  //   .catch(err => {
  //     console.error("file browser error", err);
  //     if (err.data.code === 401) location.reload();
  //   });
  // }
  this.downloadFileToUpload = downloadFileToUpload;
  function downloadFileToUpload(item) {
    return new Promise((resolve, reject) => {
      $http({
        url: self.url + DOWNLOAD_PATH_POST,
        method: 'POST',
        headers: {
          'Authorization': window.localStorage.getItem('token'),
          'Storage-Database': JSON.stringify(self.storageDatabase),
          'Content-Type': 'application/json',
          'Referrer-Policy': 'no-referrer',
          'Service': 'WI_PROJECT_STORAGE'
        },
        data: {
          'files': [item.rootIsFile ? item.path : item.path + '/'],
          'skipCompressFile': "true"
        },
        responseType: 'arraybuffer',
      }).then(response => {
        let file = new Blob([response.data], {
          type: 'file'
        });
        self.requesting = false;
        // let fileName = "I2G_Download_" + Date.now() + '_' + Math.floor(Math.random() * 100000) + '.zip';
        file.name = item.rootName;
        console.log(file);
        return resolve(file);

      })
      .catch(err => {
        console.error("file browser error", err);
        if (err.data.code === 401) location.reload();
        return reject()
      });
    });
  }
  function callbackImportLAS(response) {
    if (!response) return;
    if (response === 'UPLOAD FILES FAILED') {
      __toastr.error("Some errors while uploading file");
    } else {
      if (response.errFiles.length) {
        __toastr.error(response.errFiles.map(f => f.filename).join(', '), 'Error uploading files');
      }
      if (response.successFiles.length) {
        __toastr.success(_.uniq(response.successFiles).join(', '), 'Following files uploaded successfully');
      } else if (response.successFiles.length === files.length) {
        __toastr.success('All files uploaded successfully');
      }
      if (response.successWells.length) {
        __toastr.success(_.uniq(response.successWells.map(w => w.name)).join(', '), 'Following wells uploaded successfully');
      }
    }
  }
  function callbackImportDLIS(response) {
    // removeProgressItem(progressObj);
    if (!response) return;
    if (response === 'UPLOAD FILES FAILED') {
      __toastr.error("Some errors while uploading file");
    } else {
      return __toastr.info('DLIS file are being processed');
    }
  }

  this.checkFileExisted = function(file, metaDataRequest, sv) {
    return new Promise(res => {
      self.httpGet(self.checkFileExistedUrl + encodeURIComponent(JSON.stringify(metaDataRequest)), function(result) {
        if ((result.data && result.data.code && result.data.code === 409) && !file.overwrite) {
          return res(true);
        }else {
          return res(false);
        }
      }, {service: sv});
    })
  }
  this.uploadFile = function(file, path, metaDataRequest) {
    let uploadUrl = self.uploadUrl + encodeURIComponent((path).replace('//', '/')) + '&metaData=' + encodeURIComponent(JSON.stringify(metaDataRequest)) + '&overwrite=' + file.overwrite;
    let uploadingObject = Upload.upload({
        url: uploadUrl,
        headers: {
        'Content-Type': 'application/json',
        'Referrer-Policy': 'no-referrer',
        'Authorization': window.localStorage.getItem('token'),
        'Storage-Database': JSON.stringify(self.storageDatabase),
        'Service': "WI_PROJECT_STORAGE"
        },
        data: {
        'upload-file': file
        }
    });
    uploadingObject.then(resp => {
        console.log("Upload success");
        __toastr.success("Upload success");
    })
    .catch(err => {
        console.log("Upload terminated", err.message);
        __toastr.error("Upload error");
    });
  }
}

let app = angular.module(moduleName, ['ngFileUpload', textViewer, pdfViewer, imgPreview, storageProps, 'sideBar', 'wiSession', 'wiTableResizeable', 'wiApi', 'angularModalService', 'wiDialog']);

app.component(componentName, {
  template: require('./new-file-explorer.html'),
  controller: Controller,
  controllerAs: 'self',
  bindings: {
    rootFolder: '@',
    url: '@',
    previewUrl: '@',
    rawDataUrl: '@',
    storageDatabase: '<',
    linkedFile: '@',
    idProject: '<',
    setContainer: '<',
    hideImportToInventory: '<',
    isDatabase: '<',
    hideActionFilter: '<',
    hideAssociate: '<',
    wellReadonly: '<',
    clickNodeFn: '<',
    disablePreview: '<',
    hidePdbFeaturesPanel: '<',
    hideMetadataPanel: '<',
    checkPermission: '<',
  }
});

app.filter('strLimit', ['$filter', function ($filter) {
  return function (input, limit, more) {
    if (input.length <= limit) {
      return input;
    }
    return $filter('limitTo')(input, limit) + (more || '...');
  };
}]);

app.filter('fileExtension', ['$filter', function ($filter) {
  return function (input) {
    return /\./.test(input) && $filter('strLimit')(input.split('.').pop(), 3, '..') || '';
  };
}]);

app.filter('formatDate', ['$filter', function () {
  return function (input) {
    return moment(input).format('YYYY/MM/DD hh:mm:ss A');
    // return input.substring(0, 19).replace('T', ' ');
    // return input instanceof Date ?
    //   input.toISOString().substring(0, 19).replace('T', ' ') :
    //   (input.toLocaleString || input.toString).apply(input);
  };
}]);

app.filter('humanReadableFileSize', ['$filter', function ($filter) {
  let decimalByteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
  let binaryByteUnits = ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

  return function (input) {
    let i = -1;
    let fileSizeInBytes = input;

    do {
      fileSizeInBytes = fileSizeInBytes / 1024;
      i++;
    } while (fileSizeInBytes > 1024);

    let result = false ? binaryByteUnits[i] : decimalByteUnits[i];
    return Math.max(fileSizeInBytes, 0.1).toFixed(1) + ' ' + result;
  };
}]);

module.exports.name = moduleName;
