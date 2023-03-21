import { WiContextMenu, WiDroppable, ngVue } from "@revotechuet/misc-component-vue";
import { v4 as uuidv4 } from 'uuid';

require('pdfjs-dist/build/pdf.worker.entry.js');
// Load css
require('./new-file-explorer.less');

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
const advancedSearchDialog = require('../../dialogs/advanced-search/advanced-search-modal');
const bulkEditDialog = require('../../dialogs/bulk-edit/bulk-edit-modal');
const metadataDialog = require('../../dialogs/metadata/metadata-modal');

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
const REMOVE_DUSTBIN = '/action/remove';
const RESTORE_DUSTBIN = '/action/restore-dustbin'
const COPY_PATH = '/action/copy?';
const MOVE_PATH = '/action/move?';
const NEW_FOLDER_PATH = '/action/create-folder?';
const SEARCH_PATH = '/search';
const SEARCH_STREAM_PATH = '/search/streaming';
const SEARCH_STREAM_CANCEL_PATH = '/search/streaming/cancel';
const INDEX_SEARCH_PATH = '/search/elasticsearch';
const UPDATE_META_DATA = '/action/update-meta-data';
const CHECK_OBJECT_EXISTS = '/upload/is-existed?metaData=';
const RESTORE_REVISION = '/action/restore';
const REMOVE_REVISION = '/action/remove-revision';
const UPLOAD_FILES = '/upload/lases';
const UPLOAD_DLIS = '/upload/dlis';
const SUBMIT_TO_COMPANY_DB = '/submit/submit-files';
const PROCESSING_STATUS = '/action/status?key=';
const CANCEL_PROCESS = '/action/cancel?key=';
const GETSIZE_PATH = '/action/estimate-folder-size?dir=';
const COUNTCHILDS_PATH = '/action/count-childs?dir=';
const GET_QUICK_OBJECTS = '/objects';
const NEW_QUICK_OBJECT = '/new-row';
const DELETE_QUICK_OBJECT = '/delete';

Controller.$inject = ['$scope', '$timeout', '$filter', '$element', '$http', 'ModalService', 'Upload', 'wiSession', 'wiApi', 'wiDialog'];

function Controller($scope, $timeout, $filter, $element, $http, ModalService, Upload, wiSession, wiApi, wiDialog) {
  Object.assign($scope, {
    WiDroppable,
    WiContextMenu,
  });
  let self = this;
  let _toastr = window.__toastr || window.toastr;
  self.widthArray = [];
  self.headerArray = [
    {
      label: 'Name',
      key: 'rootName',
    },
    {
      label: 'Well Name',
      key: 'wellName'
    },
    {
      label: 'CODB Status',
      key: 'codbStatus'
    },
    {
      label: 'Data type',
      key: 'metaData.datatype'
    },
    {
      label: 'Size',
      key: 'size'
    },
    {
      label: 'Data modified',
      key: 'modifiedDate'
    }
  ];
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
  self.imgResource = {};
  self.currentPath = [];
  self.history = [];
  self.historyIndex = -1;
  self.selectedList = [];
  self.selectedItem = {};
  self.pasteList = [];
  self.requestingCount = 0;
  self.requesting = false;
  self.rootFolder = self.rootFolder || '/';
  self.filter = '';
  self.propOrder = 'rootName';
  self.reverse = false;
  // self.HEADER_CONFIG = HEADER_CONFIG;

  self.modeFilter = 'none';
  self.getSize = null;
  self.storageDatabaseString = '';
  self.dustbinMode = false;
  this.bookmarks = [];

  this.$onInit = function () {
    if (typeof self.setContainer === 'function') self.setContainer(self);
    self.rootFolder = self.rootFolder || '/';

    let searchQuery = {
      conditions: {
        operator: "and",
        children: [
          {
            operator: "or",
            children: [
              { name: "" }
            ]
          }
        ]
      },
      type: "all",
      subFolders: "included"
    }
    self.searchQuery = searchQuery;
    let indexSearchQuery = {
      conditions: {
        operator: "and",
        children: [
          {
            operator: "or",
            children: [
              { name: "" }
            ]
          }
        ]
      },
      type: "all",
      subFolders: "included"
    }
    self.indexSearchQuery = indexSearchQuery;
    function updateUrls() {
      self.rawDataUrl = self.url + RAW_DATA_PATH;
      self.exploreUrl = self.url + EXPLORE_PATH;
      self.uploadUrl = self.url + UPLOAD_PATH;
      self.downloadUrl = self.url + DOWNLOAD_PATH;
      self.removeUrl = self.url + REMOVE_PATH;
      self.removeDustbin = self.url + REMOVE_DUSTBIN;
      self.restoreDustbin = self.url + RESTORE_DUSTBIN;
      self.copyUrl = self.url + COPY_PATH;
      self.moveUrl = self.url + MOVE_PATH;
      self.newFolderUrl = self.url + NEW_FOLDER_PATH;
      self.searchUrl = self.url + SEARCH_PATH;
      self.searchStreamingUrl = self.url + SEARCH_STREAM_PATH;
      self.searchStreamingCancelUrl = self.url + SEARCH_STREAM_CANCEL_PATH;
      self.indexSearchUrl = self.url + INDEX_SEARCH_PATH;
      self.updateMetaDataUrl = self.url + UPDATE_META_DATA;
      self.checkFileExistedUrl = self.url + CHECK_OBJECT_EXISTS;
      self.restoreRevisionUrl = self.url + RESTORE_REVISION;
      self.removeRevisionUrl = self.url + REMOVE_REVISION;
      self.submitToCompanyDatabaseUrl = self.url + SUBMIT_TO_COMPANY_DB;
      self.statusUrl = self.url + PROCESSING_STATUS;
      self.cancelUrl = self.url + CANCEL_PROCESS;
      self.getFolderSizeUrl = self.url + GETSIZE_PATH;
      self.countChildsUrl = self.url + COUNTCHILDS_PATH;
      self.checkPermissionUrl = self.url + '/action/get-permission?permission=';
      self.getMetadataUrl = self.url + '/action/info';
      self.createSyncSession = self.url + '/file-explorer/create-sync-session';
      self.getQuickObjectUrl = self.quickObjectUrl + GET_QUICK_OBJECTS;
      self.newQuickObjectUrl = self.quickObjectUrl + NEW_QUICK_OBJECT;
      self.deleteQuickObjectUrl = self.quickObjectUrl + DELETE_QUICK_OBJECT;
    }
    updateUrls();
    $scope.$watch(() => self.url, updateUrls);
    $scope.$watch(() => {
      self.storageDatabaseString = JSON.stringify({ ...self.storageDatabase, mode: self.dustbinMode ? 'DUSTBIN' : 'DEFAULT' });
      return self.storageDatabaseString + self.url
    }, async () => {
      if (self.storageDatabase && self.url) {
        if (self.linkedFile) {
          //self.goToByPath(self.linkedFile);
        } else {
          self.goToPath(self.rootFolder);
        }
        self.processingKey = 'PROCESSING-' + self.storageDatabase.directory;
        self.processing = JSON.parse(localStorage.getItem(self.processingKey)) || [];

        self.bookmarks = await self.getBookmarks();
      } else {
        self.fileList = [];
      }
    });
    $scope.$watch(() => self.requestingCount, (newVal, oldVal) => {
      self.requesting = newVal > 0;
    });
    self.requesting = true;

    const unwatch = $scope.$watch(() => $scope.$root.taxonomies, () => {
      if (!$scope.$root.taxonomies) return;
      unwatch();
      const taxonomies = Object.keys($scope.$root.taxonomies).reduce((obj, key) => {
        if (!Array.isArray($scope.$root.taxonomies[key])) return obj;
        obj[key] = $scope.$root.taxonomies[key].map(i => i.item);
        return obj;
      }, {});
      utils.setSelections(taxonomies);
    });
    //#region processing status
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
    //#endregion
  };
  this.submitToCompanyDatabase = async function (files) {
    const yes = await new Promise(res => wiDialog.confirmDialog('Confirmation', 'Do you want to submit folders/files to CODB?', res));
    if (!yes) return;
    const warningFiles = files.filter(f => utils.checkMetadata(f.metaData));
    if (warningFiles.length) {
      const yes = await new Promise(res => {
        const message = `The following items' metadata are not fulfilled. Do you want to continue?<br>${warningFiles.map(f => f.rootName).join(', ')}`;
        wiDialog.confirmDialog('Warning!', message, res)
      })
      if (!yes) return;
    }
    const filePaths = files.map(f => f.path);
    self.httpPost(self.submitToCompanyDatabaseUrl, { file_paths: filePaths, project: window.localStorage.getItem('LProject') }, res => {
      _toastr && _toastr.success(`Successfully submitted folders/files to CODB`);
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
  this.getIconFile = function (name) {
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
  this.getOrderItem = function (item) {
    return item
    // ['rootIsFile',self.reverse?'-':'+'+self.propOrder]
  }
  this.orderFn = function (i1, i2) {
    if (i1.value.rootIsFile !== i2.value.rootIsFile) {
      return i1.value.rootIsFile ? 1 : -1
    }
    const v1 = _.get(i1.value, self.propOrder, '');
    const v2 = _.get(i2.value, self.propOrder, '');
    const order = self.reverse ? -1 : 1;
    switch (typeof v1) {
      case 'string':
        return v1.localeCompare(v2) * order;
      case 'number':
        return (v1 - v2) * order;
      default:
        console.trace(typeof v1, 'order type not handled')
        return 0;
    }
  }

  this.isSelected = function (item) {
    return self.selectedList.indexOf(item) !== -1;
  };

  function getFileListOrder(fileList, ...args) {
    if (!fileList) return fileList;
    return $filter('orderBy')(fileList, ...args);
  };
  this.clickNode = function (item, $event) {
    if (!item) {
      self.selectedItem = null;
      self.selectedList = [];
      return;
    }
    if (self.selectedItem !== item) {
      self.selectedItem = item;
      self.getSize = (() => {
        return new Promise((res, rej) => {
          self.httpGet(self.getFolderSizeUrl + encodeURIComponent(item.path), result => {
            self.httpGet(self.countChildsUrl + encodeURIComponent(item.path), result2 => {
              res([result.data, result2.data]);
            })
          }, { silent: true });
        });
      })
      $scope.addName = '';
      $scope.addValue = '';
    }
    let indexInSelectedList = self.selectedList.indexOf(item);

    if ($event && $event.shiftKey) {
      let list = getFileListOrder(self.fileList, self.getOrderItem, false, self.orderFn);
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
        self.clickNodeFn && self.clickNodeFn(self.selectedList);
        return;
      }
      if (lastSelected && list.indexOf(lastSelected) > indexInList) {
        $scope.temps = [];
        while (i >= indexInList) {
          current = list[i];
          !self.isSelected(current) && self.selectedList.push(current);
          i--;
        }
        self.clickNodeFn && self.clickNodeFn(self.selectedList);
        return;
      }
    }
    if ($event && $event.ctrlKey) {
      self.isSelected(item) ? self.selectedList.splice(indexInSelectedList, 1) : self.selectedList.push(item);
      self.clickNodeFn && self.clickNodeFn(self.selectedList);
      return;
    }
    self.selectedList = [item];
    self.clickNodeFn && self.clickNodeFn(self.selectedList);
  };
  this.clearHistory = function () {
    self.history = [];
    self.historyIndex = -1;
  }
  this.getCurrentPathString = function () {
    return self.rootFolder + self.currentPath.map(c => c.rootName).join('/')
  }
  function withWellName(items) {
    return items.map(item => {
      try {
        item.wellName = JSON.parse(item.metaData.well).name;
      } catch (error) {
      }
      return item
    })
  }
  this.goToPath = async function (path, history = true) {
    if (history) {
      self.historyIndex++;
      self.history.splice(self.historyIndex, self.history.length, path);
    }
    return new Promise((res, rej) => {
      self.httpGet(self.exploreUrl + encodeURIComponent(path), (result, err) => {
        if (!result || err) {
          return rej(err)
        }
        const data = result.data.data;
        self.fileList = withWellName([...data.folders, ...data.files])
        self.currentPath.length = 0;
        path.split("/").filter(v => v).map((name, idx) => {
          self.currentPath.push({ rootName: name, displayName: name });
        })
        res(data);
        !$scope.$root.$$phase && $scope.$digest();
      })
    })
  }
  this.dblClickNode = async function (item) {
    if (self.dustbinMode) return _toastr.error("This action is not allowed on dustbin mode")
    if (!item)
      return;
    if (!item.rootIsFile) {
      if (self.requesting) return;
      self.selectedList = [];
      await self.goToPath(item.path);
      // self.currentPath.length = 0;
      // item.path.slice(1, item.path.length - 1).split("/").map((name, idx) => {
      //   self.currentPath.push({ rootName: name, displayName: name });
      // })
      //self.currentPath.push({rootName: item.rootName, displayName: item.displayName});
      self.filter = '';
      self.modeFilter = 'none';
      $scope.$digest();
    } else {
      if (self.disablePreview) return;
      if (item.size === 0) {
        _toastr && _toastr.warning(`File is empty`)
        return;
      }
      self.filter = '';
      // self.selectedList.push(item);
      self.httpPost(`${self.previewUrl}/check-in-cache?file_path=${encodeURIComponent(item.path)}`,
        { item }, result => {
          // if (result.data.notCached) {
          //   _toastr ? _toastr.info(`File is being converted for next fast preview`)
          //     : console.info(`File is being converted for next fast preview`);
          // }
          self.httpPost(`${self.previewUrl}/filepreview?file_path=${encodeURIComponent(item.path)}`,
            { item }, result => {
              if (result.data.isNotReadable) {
                _toastr ? _toastr.error(`Previewing "${item.rootName}" is not available`)
                  : console.error(`Previewing "${item.rootName}" is not available`);
              } else {
                if (result.data.isTooBig) {
                  _toastr ? _toastr.error(`"${item.rootName}" exceeds the maximum file size that we can preview`)
                    : console.error(`"${item.rootName}" exceeds the maximum file size that we can preview`);
                } else {
                  let data = { title: item.rootName };
                  data.fileContent = result.data;
                  pdfViewerDialog(ModalService, self, data, item);
                  self.addRecentFile(item);

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
            }, { service: "WI_FILE_PREVIEW" })
        }, { service: "WI_FILE_PREVIEW" })
    }
    self.afterDblClick && self.afterDblClick(item);
  };
  this.openFolder = this.dblClickNode

  function vueContextMenu(event, menu) {
    self.contextMenu.$root.contextMenuEventBus.$emit('show', { pos: { x: event.pageX, y: event.pageY }, menu });
  }
  this.showContextMenu = function (item, $event) {
    $event.stopPropagation()
    let menu = []
    if (self.dustbinMode) {
      menu = [{
        label: 'Restore',
        icon: 'ti ti-share-alt',
        handler() {
          self.restoreDustbinItem();
        }
      }, {
        label: 'Delete permanently',
        icon: 'ti ti-close',
        handler() {
          self.removeNodes()
        }
      }]
    } else {
      if (item) {
        if (!self.selectedList.includes(item)) self.selectedList = [item];
        menu = [
          self.selectedList.length > 1 ? null : {
            label: 'Open',
            icon: 'ti ti-share',
            handler() {
              self.dblClickNode(item);
            }
          }, {
            label: 'Download',
            icon: 'ti ti-import',
            handler() {
              self.downloadFile(self.selectedList)
            }
          },
          self.selectedList.length === 1 && !item.rootIsFile &&
          (self.bookmarks.some(i => i.path === item.path) ?
            {
              label: 'Remove bookmark',
              icon: 'ti ti-star',
              handler() {
                self.removeBookmark(item)
              }
            } :
            {
              label: 'Bookmark',
              icon: 'ti ti-star',
              handler() {
                self.addBookmark(item)
              }
            }
          ),
          { split: true },
          {
            label: 'Copy',
            icon: 'ti ti-files',
            handler() {
              self.copyOrCut('copy')
            }
          }, {
            label: 'Cut',
            icon: 'ti ti-cut',
            handler() {
              self.copyOrCut('cut')
            }
          }, !self.pasteList.length ? null : {
            label: 'Paste',
            icon: 'ti ti-clipboard',
            handler() {
              self.paste(item)
            }
          }, {
            label: 'Delete',
            icon: 'ti ti-close',
            handler() {
              self.removeNodes()
            }
          }, self.selectedList.length < 2 ? null : {
            label: 'Bulk Edit',
            icon: 'ti ti-menu-alt',
            handler() {
              self.bulkEdit(self.selectedList);
            }
          },
          !item.rootIsFile && {
            split: true,
          },
          !item.rootIsFile && {
            label: 'Copy Sync Key',
            icon: 'ti ti-key',
            handler() {
              self.copySyncKey(item.path);
            }
          },
        ];
      } else {
        menu = [
          !self.pasteList.length ? null : {
            label: 'Paste',
            icon: 'ti ti-clipboard',
            handler() {
              self.paste()
            }
          },
          {
            label: 'Copy Sync Key',
            icon: 'ti ti-key',
            handler() {
              self.copySyncKey();
            }
          }
        ];
      }
    }
    menu = menu.filter(v => v);
    menu.length && vueContextMenu($event, menu);
  }

  this.getBookmarks = function () {
    return new Promise((resolve, reject) => {
      const url = new URL(self.getQuickObjectUrl);
      url.searchParams.set('linkType', 'favorite');
      url.searchParams.set('username', window.localStorage.getItem('username'));
      url.searchParams.set('storage_location', self.storageDatabase.directory);
      this.httpGet(url.toString(), (res, err) => {
        if (err || !res || !res.data) reject(err);
        else resolve(res.data);
      });
    })
  }
  this.showBookmarks = async function ($event) {
    const bookmarks = await self.getBookmarks();
    self.bookmarks = bookmarks;
    const menu = bookmarks.map(i => {
      return {
        label: i.path.split('/').filter(s => s).slice(-1)[0],
        tooltip: i.path,
        icon: 'folder-icon-16x16',
        handler() {
          self.goToPath(i.path);
        }
      }
    })
    if (menu.length) vueContextMenu($event, menu);
    else _toastr.info('No bookmarks');
  }

  this.showRecentFiles = function ($event) {
    const url = new URL(self.getQuickObjectUrl);
    url.searchParams.set('linkType', 'recent');
    url.searchParams.set('username', window.localStorage.getItem('username'));
    url.searchParams.set('storage_location', self.storageDatabase.directory);
    self.httpGet(url.toString(), (res, err) => {
      if (err) return;
      const files = res.data;
      const menu = files.map(i => {
        const name = i.path.split('/').filter(s => s).slice(-1)[0]
        return {
          label: name,
          tooltip: i.path,
          icon: self.getIconFile(name),
          async handler() {
            const dirPath = i.path.slice(0, i.path.lastIndexOf('/') + 1);
            if (dirPath !== self.getCurrentPathString()) {
              await self.goToPath(dirPath);
            }
            const item = self.fileList.find(f => f.rootIsFile && f.path === i.path);
            self.clickNode(item);
            !$scope.$root.$$phase && $scope.$digest();
          }
        }
      });
      if (menu.length) vueContextMenu($event, menu);
      else _toastr.info('No recent files');
    });
  }

  this.addBookmark = function (item) {
    self.httpPost(self.newQuickObjectUrl, {
      linkType: 'favorite',
      username: window.localStorage.getItem('username'),
      storage_location: self.storageDatabase.directory,
      path: item.path,
      objectType: item.rootIsFile ? 'file' : 'folder',
    }, async (res, err) => {
      self.bookmarks = await self.getBookmarks();
    })
  }

  this.removeBookmark = async function (item) {
    const obj = self.bookmarks.find(b => b.path === item.path);
    if (!obj) {
      self.bookmarks = await self.getBookmarks();
      return;
    }
    self.httpPost(self.deleteQuickObjectUrl, obj, async (res, err) => {
      if (err) return;
      self.bookmarks = await self.getBookmarks();
    })
  }

  this.addRecentFile = function (item) {
    self.httpPost(self.newQuickObjectUrl, {
      linkType: 'recent',
      username: window.localStorage.getItem('username'),
      storage_location: self.storageDatabase.directory,
      path: item.path,
      objectType: item.rootIsFile ? 'file' : 'folder',
    }, (res, err) => {
    })
  }

  this.getDownloadLink = function (items) {
    if (items.length > 1) return '';
    let item = Array.isArray(items) ? items[0] : items;
    if (!item || !item.rootIsFile)
      return '';

    return self.downloadUrl + encodeURIComponent(item.path) + `&token=${window.localStorage.getItem('token')}&storage_database=${self.storageDatabaseString}`;
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
    self.requestingCount++;
    // // let item = Array.isArray(items) ? items[0] : items;
    // // if (!item || !item.rootIsFile)
    // //     return;
    //
    // const a = document.createElement('a');
    // a.download = item.rootName || 'untitled';
    // a.href = self.downloadUrl + encodeURIComponent(item.path) + `&token=${window.localStorage.getItem('token')}&storage_database=${self.storageDatabaseString}`;
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
        'Storage-Database': self.storageDatabaseString,
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
      self.requestingCount--;
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
    if (typeof path === 'string') children = [{ location: path }];
    if (Array.isArray(path)) {
      let pathsCP = angular.copy(path);
      _.remove(pathsCP, t => !t);
      children = pathsCP.map(p => {
        return { location: p }
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
      self.filter = '[Related]';
      self.fileList = res.data.data;
      self.modeFilter = 'related';
    });
  }
  this.goTo = async function (index, callback) {
    if (self.requesting) return;
    if (index == -999) {
      // refresh
      await self.goToPath(self.getCurrentPathString(), false)
      if (self.selectedItem) {
        const item = self.fileList.find(f => f.rootName === self.selectedItem.rootName);
        self.clickNode(item);
      }
      callback && callback();
      self.httpGet(`${self.previewUrl}/refresh-cache`, result => {
        //console.log(result.data)
      }, { service: "WI_FILE_PREVIEW" })
    } else {
      self.selectedList = [];
      const newPath = self.rootFolder + self.currentPath.slice(0, index + 1).map(c => c.rootName).join('/');
      await self.goToPath(newPath)
      callback && callback(self.fileList);
    }
  };
  this.goBack = function () {
    if (self.requesting || self.historyIndex < 1) return;
    self.goToPath(self.history[--self.historyIndex], false);
  }
  this.goForward = function () {
    if (self.requesting || self.historyIndex >= self.history.length - 1) return;
    self.goToPath(self.history[++self.historyIndex], false);
  }

  this.removeNodes = function () {
    if (!self.selectedList)
      return;
    let mess = "Are you sure you want to delete " + (self.selectedList.length > 1 ? self.selectedList.length + ' items?' : ' this item?');
    wiDialog.confirmDialog("Delete Confirmation", mess, function (ret) {
      if (ret) {
        async.each(self.selectedList, (node, next) => {
          // self.httpGet(self.removeUrl + encodeURIComponent(node.path), result => {
          //   console.log(result);
          //   next();
          // });
          self.httpPost(self.removeDustbin, { metaData: { ...node.metaData, realpath: node.path } }, res => {
            console.log(res)
            next();
          });
        }, err => {
          if (!err) {
            self.goTo(-999);
          }
        })
      }
    });
  };

  this.restoreDustbinItem = async function () {
    if (!self.selectedList) return;
    console.log("Restore ", self.selectedList)
    async.each(self.selectedList, (node, next) => {
      wiDialog.promptDialog({
        title: "Restore object to " + node.metaData.realpath,
        inputName: "Restore item name",
        input: function getName(key) {
          let resp = "";
          if (key.endsWith("/")) {
            resp = key.split("/").slice(-2)[0];
          } else {
            resp = key.substring(key.lastIndexOf("/") + 1);
            if (resp.lastIndexOf(".") !== -1) {
              resp = resp.substring(0, resp.lastIndexOf('.'))
            }
          }
          return resp.substring(13, resp.length);
        }(node.path)
      }, function (newName) {
        console.log("====new name ", newName)
        self.httpPost(self.restoreDustbin, { newName: newName, metaData: { ...node.metaData } }, res => {
          console.log(res)
          next();
        });
      })
    }, err => {
      if (!err) {
        self.goTo(-999);
      }
    })
  }

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
    wiSession.putData('location', JSON.stringify({ option: 'multi', value: locations }));
  }
  this.multiLocationCopied = function (items) {
    let locations = JSON.parse(wiSession.getData('location'));
    let _locations = items.map(item => item.metaData.location);
    if (locations && Array.isArray(locations.value) && locations.value.length == _locations.length
      && !locations.value.some(l => !_locations.includes(l))) return true;
    else return false;
  }
  this.paste = function (folder) {
    if (!(self.pasteList))
      return;
    switch (self.pasteList.action) {
      case 'copy':
        async.eachSeries(self.pasteList, (file, next) => {
          const paths = [...self.currentPath, folder && !folder.rootIsFile].filter(p => p)
          const url = new URL(self.copyUrl)
          url.searchParams.set('from', file.path)
          url.searchParams.set('dest', self.rootFolder + paths.map(c => c.rootName).join('/'))
          self.httpGet(url.toString(), res => {
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
          self.goTo(-999);
        });
        break;
      case 'cut':
        async.eachSeries(self.pasteList, (file, next) => {
          let from = `from=${encodeURIComponent(file.path)}&`;
          let dest = `dest=${encodeURIComponent(self.getCurrentPathString())}`;

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
          self.goTo(-999);
        });
        break;
    }
  };

  this.copyOrCut = async function (action) {
    if (!self.selectedList)
      return;
    if (this.checkPermission) {
      const res = await new Promise(resolve => this.httpGet(self.checkPermissionUrl + 'update', resolve));
      if (res.data.error) return;
    }
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
      const res = await new Promise(resolve => this.httpGet(self.checkPermissionUrl + 'update', resolve));
      if (res.data.error) return;
    }
    newFolderDialog(ModalService, self);
  };

  self.searching = false;
  function doSearch(payload, url) {
    if (self.searching) return;
    self.searching = true;
    if (self.searchMode === 'stream') {
      self.fileList = [];
      let result = '';
      const EOL = '***eol***';
      self.abortSearch = self.httpPostStreaming(url || self.searchStreamingUrl, payload,
        res => {
          if (!self.searching) return;
          result += res;
          const lines = result.split(EOL)
          if (lines.length > 1) {
            result = result.slice(result.indexOf(EOL) + EOL.length);
            const line = lines[0];
            try {
              const files = withWellName(JSON.parse(line))
              self.fileList.push(...files);
              $scope.$digest();
            } catch (error) {
              console.log(line);
            }
          }
        }, () => {
          self.searching = false;
        });
    } else {
      self.httpPost(url || self.searchUrl, payload, res => {
        self.fileList = withWellName(res.data.data)
      });
    }
  }
  this.search = function () {
    self.searchQuery = {
      conditions: {
        operator: "and",
        children: [
          {
            operator: "or",
            children: [
              { name: "" }
            ]
          }
        ]
      },
      type: "all",
      subFolders: "included"
    };
    if (self.filter != '') {
      let payload = {
        folder: self.getCurrentPathString(),
        content: {
          conditions: {
            children: [{ name: self.filter }],
            operator: "or"
          },
          type: "all",
          subFolders: "included",
        }
      };
      self.modeFilter = 'simple search';
      doSearch(payload);
    } else if (!self.filter || self.filter === '') {
      self.searching = false;
      self.modeFilter = 'none';
      self.goTo(-999);
    } else if (self.filter != '[Advanced search]') self.goTo(-999);
  }
  this.advancedSearch = function () {
    if (self.searching) return;
    advancedSearchDialog(ModalService, self, function (isSearching) {
      if (isSearching) {
        self.modeFilter = 'advanced search';
        self.filter = '[Advanced search]';
        let payload = {
          folder: self.getCurrentPathString(),
          content: self.searchQuery
        };
        doSearch(payload);
      }
    });
  }
  this.indexSearch = function () {
    if (self.searching) return;
    advancedSearchDialog(ModalService, self, function (isSearching) {
      if (isSearching) {
        self.modeFilter = 'index search';
        self.filter = '[Index search]';
        const payload = {
          folder: self.getCurrentPathString(),
          content: self.indexSearchQuery
        };
        doSearch(payload, self.indexSearchUrl);
      }
    }, 'index');
  }
  this.clearSearch = function () {
    if (self.searching) {
      self.abortSearch && self.abortSearch();
      self.searching = false;
    } else {
      if (!self.filter) return;
      self.filter = '';
      self.modeFilter = 'none';
      self.search();
    }
  }
  this.httpGet = function (url, cb, options = {}) {
    if (!options.silent) {
      self.requestingCount++;
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
        'Storage-Database': self.storageDatabaseString,
        'Service': (options || {}).service || 'WI_PROJECT_STORAGE'
      }
    };
    $http(reqOptions).then(result => {
      if (!options.silent) {
        self.requestingCount--;
        if (result.data && result.data.error) {
          toastr.error(result.data.message || 'Unknown error');
        }
      }
      cb(result);
    }, err => {
      console.error("file browser error", err);
      if (err.data && err.data.code === 401) location.reload();
      if (!options.silent) {
        self.requestingCount--;
        toastr.error(err.data && err.data.message || 'Error connecting to server');
      }
      cb(null, err);
    });
  };

  this.httpPost = function (url, payload, cb, options = {}) {
    if (!options.silent) {
      self.requestingCount++;
    }
    let reqOptions = {
      method: 'POST',
      url: url,
      headers: {
        'Content-Type': 'application/json',
        'Referrer-Policy': 'no-referrer',
        'Authorization': window.localStorage.getItem('token'),
        'Storage-Database': self.storageDatabaseString,
        'Service': (options || {}).service || 'WI_PROJECT_STORAGE'
      },
      data: payload
    };
    $http(reqOptions).then(result => {
      if (!options.silent) {
        self.requestingCount--;
        if (result.data && result.data.error) {
          toastr.error(result.data.message || 'Unknown error');
        }
      }
      cb(result);
    }, err => {
      console.error("file browser request", err);
      if (err.data && err.data.code === 401) location.reload();
      if (!options.silent) {
        self.requestingCount--;
        toastr.error(err.data && err.data.message || 'Error connecting to server');
      }
    })
  };

  this.httpPostStreaming = function (url, payload, chunkCb, doneCb, options = {}) {
    if (!options.silent) {
      self.requestingCount++;
    }
    const uuid = uuidv4();
    const abortController = new AbortController();
    const decoder = new TextDecoder('utf-8');
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referrer-Policy': 'no-referrer',
        'Authorization': window.localStorage.getItem('token'),
        'Storage-Database': self.storageDatabaseString,
        'Service': (options || {}).service || 'WI_PROJECT_STORAGE'
      },
      body: JSON.stringify({ ...payload, uuid }),
      signal: abortController.signal,
    }).then(res => {
      const reader = res.body.getReader();
      function readChunk({ value, done }) {
        if (done) {
          if (!options.silent) {
            self.requestingCount--;
          }
          doneCb && doneCb();
          $scope.$digest();
          return;
        }
        chunkCb && chunkCb(decoder.decode(value));
        return reader.read().then(readChunk);
      }
      reader.read().then(readChunk);
    }).catch(err => {
      if (err.name === 'AbortError') return;
      console.error("file browser request", err);
      if (err.data && err.data.code === 401) location.reload();
      if (!options.silent) {
        self.requestingCount--;
        toastr.error(err.data && err.data.message || 'Error connecting to server');
      }
    });
    return () => {
      self.httpPost(self.searchStreamingCancelUrl, { uuid }, () => {
        abortController.abort();
      });
    }
  }

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
    if (typeof (payload.metaData.name) == 'string' && !utils.validateNodeName(payload.metaData.name)) {
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
      self.goTo(-999)
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
    if (self.modeFilter !== 'none') {
      self.goTo(-999, function () {
        self.modeFilter = 'none';
        self.filter = '';
      });
    }
  }
  this.$onDestroy = function () {
    delete window.fileBrowser;

  }
  this.importCSV = function (items) {
    wiDialog.csvImportDialog();
  }
  // this.importFilesToInventory = function(items) {
  //   if (items.length === 0) return;
  //   self.requestingCount++;
  //   if(items.length == 1) {
  //     if(items[0].rootName.split('.').length > 1 && (items[0].rootName.split('.').pop() == 'las' || items[0].rootName.split('.').pop() == 'dlis' || items[0].rootName.split('.').pop() == 'csv')) {
  //       downloadFileToUpload(items[0]);
  //     }else {
  //       self.requestingCount--;
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
  //       self.requestingCount--;
  //       __toastr.error("Only accept multiple file las", "Error");
  //     }
  //   }
  // }
  this.importFilesToInventory = function (items) {
    if (items.length === 0) return;
    self.requestingCount++;
    if (items.length == 1) {
      if (items[0].rootName.split('.').length > 1 && (items[0].rootName.split('.').pop() == 'las' || items[0].rootName.split('.').pop() == 'dlis' || items[0].rootName.split('.').pop() == 'csv')) {
        importCurves(items[0]);
      } else {
        self.requestingCount--;
        __toastr.error("Only accept file las, dlis, csv", "Error");
      }
    } else {
      let isAllLas = true;
      for (let i in items) {
        if (items[i].rootName.split('.').length > 1 && items[i].rootName.split('.').pop() != 'las') {
          isAllLas = false;
          break;
        }
      }
      if (isAllLas) {
        items.forEach(item => {
          importCurves(item);
        });
      } else {
        self.requestingCount--;
        __toastr.error("Only accept multiple file las", "Error");
      }
    }
  }
  function importCurves(fileToDownload) {
    downloadFileToUpload(fileToDownload)
      .then((file) => {
        if (file.name.split('.').length > 1) {
          switch (file.name.split('.').pop()) {
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
  this.importZoneSet = function (items) {
    if (items.length === 0) return;
    self.requestingCount++;
    downloadFileToUpload(items[0])
      .then(file => {
        if (file.name.split('.').length > 1 && file.name.split('.').pop() === 'csv') {
          self.requestingCount++;
          wiDialog.importZoneSet(file, self.idProject, callBackImport);
        } else {
          __toastr.error("Only accept file csv", "Error");
        }
      });
    console.log("import zone set");
  }
  this.importMarkerSet = function (items) {
    if (items.length === 0) return;
    self.requestingCount++;
    downloadFileToUpload(items[0])
      .then(file => {
        if (file.name.split('.').length > 1 && file.name.split('.').pop() === 'csv') {
          self.requestingCount++;
          wiDialog.importMarkerSet(file, self.idProject, callBackImport);
        } else {
          __toastr.error("Only accept file csv", "Error");
        }
      });
    console.log("import marker set");
  }
  function callBackImport(data) {
    self.requestingCount--;
    console.log(data);
  }
  // function downloadFileToUpload(item) {
  //   $http({
  //     url: self.url + DOWNLOAD_PATH_POST,
  //     method: 'POST',
  //     headers: {
  //       'Authorization': window.localStorage.getItem('token'),
  //       'Storage-Database': self.storageDatabaseString,
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
  //     self.requestingCount--;
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
          'Storage-Database': self.storageDatabaseString,
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
        self.requestingCount--;
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

  this.checkFileExisted = function (file, metaDataRequest, sv) {
    return new Promise(res => {
      self.httpGet(self.checkFileExistedUrl + encodeURIComponent(JSON.stringify(metaDataRequest)), function (result) {
        if ((result.data && result.data.code && result.data.code === 409) && !file.overwrite) {
          return res(true);
        } else {
          return res(false);
        }
      }, { service: sv });
    })
  }
  this.uploadFile = function (file, path, metaDataRequest) {
    let uploadUrl = self.uploadUrl + encodeURIComponent((path).replace('//', '/')) + '&metaData=' + encodeURIComponent(JSON.stringify(metaDataRequest)) + '&overwrite=' + file.overwrite;
    let uploadingObject = Upload.upload({
      url: uploadUrl,
      headers: {
        'Content-Type': 'application/json',
        'Referrer-Policy': 'no-referrer',
        'Authorization': window.localStorage.getItem('token'),
        'Storage-Database': self.storageDatabaseString,
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
  this.previewMetadata = function (metadata, title) {
    metadataDialog(ModalService, metadata, title);
  }
  this.copySyncKey = function (path) {
    if (!path) path = self.getCurrentPathString();
    self.httpPost(self.createSyncSession, { path }, async function (res) {
      const syncKey = self.storageDatabase.directory + '/' + res.data.syncKey + path;
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(syncKey);
        window.toastr.success("Sync key copied");
      } else {
        wiDialog.confirmDialog('Sync key', `<span style="word-break:break-all;user-select:all;">${syncKey}</span>`, null, [
          {
            title: 'Close',
            onClick: wiModal => wiModal.close(),
          }
        ])
      }
    });
  }
  this.switchStorageMode = function () {
    self.dustbinMode = !self.dustbinMode;
    if (self.dustbinMode) {
      this.headerArray[1] = {
        label: 'Deleted',
        key: 'deletedTime'
      }
    } else {
      this.headerArray[1] = {
        label: 'CODB Status',
        key: 'codbStatus'
      }
    }
    self.clearHistory();
  }

  async function getFilesInFolder(item, path = '') {
    if (!item) return []
    if (item.isFile) return new Promise(res => {
      item.file(file => {
        Object.defineProperty(file, 'webkitRelativePath', { value: path + file.name })
        res([file]);
      });
    });
    const entries = await new Promise(res => item.createReader().readEntries(res));
    const files = await Promise.all(entries.map(e => getFilesInFolder(e, path + item.name + '/')));
    return files.flat();
  }
  this.getFilesDrop = async function (event) {
    const items = Array.from(event.dataTransfer.items).map(i => i.webkitGetAsEntry()).filter(v => v);
    const files = Array.from(event.dataTransfer.files).filter((f, i) => items[i].isFile);
    const folders = items.filter(i => i.isDirectory);
    const filesInFolders = (await Promise.all(folders.map(f => getFilesInFolder(f)))).flat();
    return [files, filesInFolders];
  }
  this.onDrop = async function (event) {
    const [files, filesInFolders] = await self.getFilesDrop(event);
    uploadFileDialog(ModalService, Upload, self, null, files, filesInFolders);
  }
}

let app = angular.module(moduleName, [
  'ngFileUpload',
  textViewer,
  pdfViewer,
  imgPreview,
  storageProps,
  'sideBar',
  'wiSession',
  'wiTableResizeable',
  'wiApi',
  'angularModalService',
  'wiDialog',
  'wiRightClick',
  ngVue,
]);

app.component(componentName, {
  template: require('./new-file-explorer.html'),
  controller: Controller,
  controllerAs: 'self',
  bindings: {
    rootFolder: '@',
    url: '@',
    previewUrl: '@',
    rawDataUrl: '@',
    quickObjectUrl: '@',
    storageDatabase: '<',
    linkedFile: '@',
    idProject: '<',
    setContainer: '<',
    hideImportToInventory: '<',
    isDatabase: '<',
    hideActionFilter: '<',
    hideAssociate: '<',
    clickNodeFn: '<',
    afterDblClick: '<',
    disablePreview: '<',
    hidePdbFeaturesPanel: '<',
    hideMetadataPanel: '<',
    getSize: '<',
    checkPermission: '<',
    readonlyValues: '<',
    searchMode: '<',
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

export const name = moduleName;
