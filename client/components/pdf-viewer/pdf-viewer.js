require('./pdf-viewer.less');

const moduleName = 'pdf-viewer';
const componentName = 'pdfViewer';

Controller.$inject = ['$scope'];
function Controller($scope) {
  let self = this;

  this.$onInit = function () {
    self.PDFJS = require('pdfjs-dist');
    self.totalPages = 0;
    self.options = {
      scale: 1.5
    }
    // pdfjsLib.GlobalWorkerOptions.workerSrc = 'file-explorer-module.js';

    // self.pdfDoc = null;
    // self.pageNum = 1;
    // self.totalPage = 0;
    // self.pageRendering = false;
    // self.pageNumPending = null;
    // self.scale = 1.5;
    // self.canvas = document.getElementById('pdfViewer');

    $scope.$watch(() => self.base64Data, (newVal, oldVal) => {
      if (newVal) {
        self.pdfHolder = document.getElementById('holder');
        self.pdfEncoded = atob(newVal);
        renderPDF(self.pdfEncoded);
        // self.loadingTask = pdfjsLib.getDocument({
        //   data: atob(newVal)
        // });

        // self.loadingTask.promise.then((pdfDoc_) => {
        //   $scope.$apply(() => {
        //     self.pdfDoc = pdfDoc_;
        //     self.totalPage = self.pdfDoc.numPages;
        //   })

        //   renderPage(self.pageNum);
        // })
      }
    })

    $scope.$watch(() => self.getCtrl, (newVal, oldVal) => {
      if (newVal) {
        self.getCtrl(self);
      }
    })
  }

  this.loadMore = function () {
    self.PDFJS.getDocument({
      data: self.pdfEncoded
    }).then(pdfDoc => {
      let totalPages = self.totalPages;
      self.totalPages += 10;
      for (let i = totalPages + 1; i <= totalPages + 10 && i <= self.pdfPages; i++) {
        pdfDoc.getPage(i).then(renderPage);
      }
    });
  }

  function renderPDF(pdfEncoded) {
    self.PDFJS.disableWorker = true;
    self.PDFJS.getDocument({
      data: pdfEncoded
    }).then(pdfDoc => {
      self.pdfPages = pdfDoc.numPages;
      self.pagesToShow = self.pagesToShow || self.pdfPages;
      renderPages(pdfDoc);
    });
  }

  function renderPage(page) {
    let viewport = page.getViewport(self.options.scale);
    let div = document.createElement('div');
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    let renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };

    canvas.height = viewport.height;
    canvas.width = viewport.width;
    div.appendChild(canvas);
    self.pdfHolder.appendChild(div);

    page.render(renderContext);
  }

  function renderPages(pdfDoc) {
    let totalPages = self.totalPages;
    self.totalPages += self.pagesToShow;
    for (let i = totalPages + 1; i <= totalPages + self.pagesToShow && i <= self.pdfPages; i++) {
      pdfDoc.getPage(i).then(renderPage);
    }
  }

  // function renderPage(num) {
  //   self.pageRendering = true;
  //   let canvas = document.getElementById('pdfViewer');
  //   let ctx = canvas.getContext('2d');

  //   self.pdfDoc.getPage(num).then((page) => {
  //     let viewport = page.getViewport(self.scale);
  //     canvas.height = viewport.height;
  //     canvas.width = viewport.width;

  //     let renderContext = {
  //       canvasContext: ctx,
  //       viewport: viewport
  //     };

  //     let renderTask = page.render(renderContext);

  //     renderTask.promise.then(() => {
  //       self.pageRendering = false;
  //       if (self.pageNumPending !== null) {
  //         renderPage(self.pageNumPending);
  //         self.pageNumPending = null;
  //       }
  //     })
  //   })
  // }

  // self.onPrevPage = function () {
  //   if (self.pageNum <= 1) {
  //     return;
  //   }
  //   self.pageNum--;
  //   queueRenderPage(self.pageNum);
  // }

  // self.onNextPage = function () {
  //   if (self.pageNum >= self.pdfDoc.numPages) {
  //     return;
  //   }
  //   self.pageNum++;
  //   queueRenderPage(self.pageNum);
  // }

  // function queueRenderPage(num) {
  //   if (self.pageRendering) {
  //     self.pageNumPending = num;
  //   } else {
  //     renderPage(num);
  //   }
  // }
}

let app = angular.module(moduleName, []);

app.component(componentName, {
  template: require('./pdf-viewer.html'),
  controller: Controller,
  controllerAs: 'self',
  bindings: {
    base64Data: '<',
    pagesToShow: '<',
    getCtrl: '<'
  }
})

module.exports.name = moduleName;