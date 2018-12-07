// Load css
require('./file-explorer.less');

// Load js
require('../../vendor/js/ng-file-upload.min');
const async = require('../../vendor/js/async.min');

// const crypto = require('crypto');
const textViewer = require('../text-viewer/text-viewer').name;
const pdfViewer = require('../pdf-viewer/pdf-viewer').name;
const imgPreview = require('../img-preview/img-preview').name
const textViewerDialog = require('../../dialogs/text-viewer/text-viewer-modal');
const pdfViewerDialog = require('../../dialogs/pdf-viewer/pdf-viewer-modal');
const uploadFileDialog = require('../../dialogs/upload-files/upload-files-modal');

const moduleName = 'file-explorer';
const componentName = 'fileExplorer';

// const ALGORITHM = 'aes-256-cbc';
// const SECRET_KEY = 'secretKey';
const HEADER_CONFIG = {
    'Content-Type': 'application/json',
    'Referrer-Policy': 'no-referrer',
    'Authorization': `hoangk'stoken`,
};
const RAW_DATA_PATH = '/read-file?file_path=';
const EXPLORE_PATH = '/file-explorer/shallow?dir=';
const UPLOAD_PATH = '/upload?location=';
const DOWNLOAD_PATH = '/download?file_path=';
const REMOVE_PATH = '';

Controller.$inject = ['$scope', '$element', '$http', 'ModalService', 'Upload'];
function Controller($scope, $element, $http, ModalService, Upload) {
    let self = this;

    this.$onInit = function () {
        self.imgResource = {};
        self.currentPath = [];
        self.selectedList = [];
        self.requesting = false;
        self.rootFolder = self.rootFolder || '/';

        self.rawDataUrl = self.url + RAW_DATA_PATH;
        self.exploreUrl = self.url + EXPLORE_PATH;
        self.uploadUrl = self.url + UPLOAD_PATH;
        self.downloadUrl = self.url + DOWNLOAD_PATH;
        self.removeUrl = self.url + REMOVE_PATH;

        self.httpGet(self.exploreUrl + encodeURIComponent(self.rootFolder), result => {
            if (result) {
                let data = result.data.data;
                self.fileList = [...data.files, ...data.folders];
            } else {
                console.log('===empty');
            }
        })
    }

    this.isSelected = function (item) {
        return self.selectedList.indexOf(item) !== -1;
    };

    this.clickNode = function (item, $event) {
        let indexInSelectedList = self.selectedList.indexOf(item);

        if ($event && $event.shiftKey) {
            let list = self.fileList;
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
                return;
            }
            if (lastSelected && list.indexOf(lastSelected) > indexInList) {
                $scope.temps = [];
                while (i >= indexInList) {
                    current = list[i];
                    !self.isSelected(current) && self.selectedList.push(current);
                    i--;
                }
                return;
            }
        }
        if ($event && $event.ctrlKey) {
            self.isSelected(item) ? self.selectedList.splice(indexInSelectedList, 1) : self.selectedList.push(item);
            return;
        }
        self.selectedList = [item];
    }

    this.dblClickNode = function (item) {
        if (!item.rootIsFile) {
            self.selectedList = [];
            self.httpGet(self.exploreUrl + encodeURIComponent(item.path), result => {
                let data = result.data.data;
                self.fileList = [...data.files, ...data.folders];
                self.currentPath.push(item.rootName);
            })
        } else {
            self.httpGet(self.rawDataUrl + encodeURIComponent(item.path), result => {
                let data = { title: item.rootName };
                let resource = result.data.data;
                data.fileContent = resource;
                switch (true) {
                    case /\.pdf$/.test(self.getExtFile(item)):
                        data.fileContent = resource.base64;
                        pdfViewerDialog(ModalService, data);
                        break;
                    case /\.(jpg|png)$/.test(self.getExtFile(item)):
                        self.imgResource.title = item.rootName;
                        self.imgResource.fileContent = resource.base64;
                        let imgCtnElm = document.getElementById('img-container');
                        self.imgResource.parentElem = imgCtnElm;
                        imgCtnElm.style.display = 'block';
                        break;
                    default:
                        data.fileContent = resource.utf8;
                        textViewerDialog(ModalService, data);
                }
            })
        }
    }

    this.downloadFile = function (item) {
        self.requesting = !self.requesting;
        let header = HEADER_CONFIG;
        header.responseType = 'arraybuffer';
        let reqOptions = {
            method: 'GET',
            url: self.downloadUrl + encodeURIComponent(item.path),
            headers: header,
        }
        $http(reqOptions).then(result => {
            self.requesting = !self.requesting;
        })
    }

    this.goTo = function (index) {
        self.selectedList = [];
        self.currentPath = self.currentPath.slice(0, index + 1);
        let newPath = self.rootFolder + self.currentPath.join('/');
        self.httpGet(self.exploreUrl + encodeURIComponent(newPath), result => {
            let data = result.data.data;
            self.fileList = [...data.files, ...data.folders];
        })
    }

    this.removeNodes = function () {
        async.each(self.selectedList, (node, next) => {
            let payload = angular.copy(node);
            self.httpPost(self.removeUrl, payload, result => {
                console.log(result);
                next();
            })
        }, err => {
            if (!err) {
                self.goTo(self.currentPath.length - 1);
            }
        })
    }

    this.uploadFiles = function () {
        let path = self.uploadUrl + encodeURIComponent(self.rootFolder + self.currentPath.join('/'));
        uploadFileDialog(ModalService, Upload, self);
    }

    this.httpGet = function (url, cb) {
        self.requesting = !self.requesting;
        let reqOptions = {
            method: 'GET',
            url: url,
            headers: HEADER_CONFIG
        }
        $http(reqOptions).then(result => {
            self.requesting = !self.requesting;
            cb(result);
        }, err => {
            self.requesting = !self.requesting;
            console.log(err);
        });
    }

    this.httpPost = function (url, payload, cb) {
        self.requesting = !self.requesting;
        let reqOptions = {
            method: 'POST',
            url: url,
            headers: HEADER_CONFIG,
            data: payload
        }
        $http(reqOptions).then(result => {
            self.requesting = !self.requesting;
            cb(result);
        })
    }

    this.getExtFile = function (item) {
        if (!item.rootIsFile)
            return '';
        let arr = item.rootName.split('.');
        return '.' + arr[arr.length - 1];
    }

    // function encrypt(text) {
    //     var cipher = crypto.createCipher(ALGORITHM, SECRET_KEY)
    //     var crypted = cipher.update(text, 'utf8', 'hex')
    //     crypted += cipher.final('hex');
    //     return crypted;
    // }
}

let app = angular.module(moduleName, ['ngFileUpload', textViewer, pdfViewer, imgPreview]);

app.component(componentName, {
    template: require('./file-explorer.html'),
    controller: Controller,
    controllerAs: 'self',
    bindings: {
        rootFolder: '@',
        url: '@',
        rawDataUrl: '@'
    }
})

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
        return input instanceof Date ?
            input.toISOString().substring(0, 19).replace('T', ' ') :
            (input.toLocaleString || input.toString).apply(input);
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

// // Load js
// require('../libs/jsTree-directive/jsTree.directive');
// require('../libs/jsTree/jstree.min');

// // Load css
// require('./file-explorer.less');
// require('../libs/jsTree/style.min.css');

// const moduleName = 'file-explorer';
// const componentName = 'fileExplorer';

// function Controller($scope, $element, $http, $timeout) {
//     let self = this;

//     this.$onInit = function () {
//         this.fileViewer = 'Please select a file to view its contents';
//     }

//     $scope.fileList = this.fileList || function (e, data) {
//         let node = data.node.li_attr;
//         if (node.isLeaf) {
//             $http.get('/api/resource?resource=' + encodeURIComponent(node.base)).then(function (result) {
//                 let fileContent = result.data;
//                 if (typeof fileContent == 'object') {
//                     fileContent = JSON.stringify(fileContent, undefined, 2);
//                 }
//                 self.fileViewer = fileContent;
//                 self.pdfData = atob(fileContent);
//                 loadingTask = pdfjsLib.getDocument({
//                     data: self.pdfData
//                 });

//                 loadingTask.promise.then((pdfDoc_) => {
//                     pdfDoc = pdfDoc_;
//                     document.getElementById('page_count').textContent = pdfDoc.numPages;

//                     renderPage(pageNum);
//                 })

//             })
//         } else {
//             self.fileViewer = 'Please select a file to view its contents';
//         }
//     }
//     let pdfjsLib = require('pdfjs-dist');
//     pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdf.worker.min.js';


//     this.pdfData = atob(
//         'JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwog' +
//         'IC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXMKICAv' +
//         'TWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0K' +
//         'Pj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAg' +
//         'L1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSIAogICAgPj4KICA+' +
//         'PgogIC9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjQgMCBvYmoKPDwKICAvVHlwZSAvRm9u' +
//         'dAogIC9TdWJ0eXBlIC9UeXBlMQogIC9CYXNlRm9udCAvVGltZXMtUm9tYW4KPj4KZW5kb2Jq' +
//         'Cgo1IDAgb2JqICAlIHBhZ2UgY29udGVudAo8PAogIC9MZW5ndGggNDQKPj4Kc3RyZWFtCkJU' +
//         'CjcwIDUwIFRECi9GMSAxMiBUZgooSGVsbG8sIHdvcmxkISkgVGoKRVQKZW5kc3RyZWFtCmVu' +
//         'ZG9iagoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4g' +
//         'CjAwMDAwMDAwNzkgMDAwMDAgbiAKMDAwMDAwMDE3MyAwMDAwMCBuIAowMDAwMDAwMzAxIDAw' +
//         'MDAwIG4gCjAwMDAwMDAzODAgMDAwMDAgbiAKdHJhaWxlcgo8PAogIC9TaXplIDYKICAvUm9v' +
//         'dCAxIDAgUgo+PgpzdGFydHhyZWYKNDkyCiUlRU9G');

//     let pdfDoc = null;
//     let pageNum = 1;
//     let pageRendering = false;
//     let pageNumPending = null;
//     let scale = 0.8;
//     let canvas = document.getElementById('pdfViewer');
//     let ctx = canvas.getContext('2d');

//     function renderPage(num) {
//         pageRendering = true;

//         pdfDoc.getPage(num).then((page) => {
//             let viewport = page.getViewport(scale);
//             canvas.height = viewport.height;
//             canvas.width = viewport.width;

//             let renderContext = {
//                 canvasContext: ctx,
//                 viewport: viewport
//             };

//             let renderTask = page.render(renderContext);

//             renderTask.promise.then(() => {
//                 pageRendering = false;
//                 if (pageNumPending !== null) {
//                     renderPage(pageNumPending);
//                     pageNumPending = null;
//                 }
//             })
//         })
//     }

//     function queueRenderPage(num) {
//         if (pageRendering) {
//             pageNumPending = num;
//         } else {
//             renderPage(num);
//         }
//     }

//     function onPrevPage() {
//         if (pageNum <= 1) {
//             return;
//         }
//         pageNum--;
//         document.getElementById('page_num').textContent = pageNum;
//         queueRenderPage(pageNum);
//     }
//     document.getElementById('prev').addEventListener('click', onPrevPage);

//     function onNextPage() {
//         if (pageNum >= pdfDoc.numPages) {
//             return;
//         }
//         pageNum++;
//         document.getElementById('page_num').textContent = pageNum;
//         queueRenderPage(pageNum);
//     }
//     document.getElementById('next').addEventListener('click', onNextPage);

//     let loadingTask = pdfjsLib.getDocument({
//         data: self.pdfData
//     });

//     loadingTask.promise.then((pdfDoc_) => {
//         pdfDoc = pdfDoc_;
//         document.getElementById('page_num').textContent = pageNum;
//         document.getElementById('page_count').textContent = pdfDoc.numPages;

//         renderPage(pageNum);
//     })
// }

// let app = angular.module(moduleName, ['jsTree.directive']);

// app.component(componentName, {
//     template: require('./file-explorer.html'),
//     controller: Controller,
//     controllerAs: 'self',
//     bindings: {
//         fileViewer: '<',
//         fileList: '<'
//     }
// })

// module.exports.name = moduleName;