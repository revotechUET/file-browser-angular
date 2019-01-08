require('./pdf-viewer.less');

const moduleName = 'pdf-viewer';
const componentName = 'pdfViewer';

Controller.$inject = ['$scope'];
function Controller($scope) {
  let self = this;

  this.$onInit = function () {
    self.PDFJS = require('pdfjs-dist');
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
        renderPDF(atob(newVal), document.getElementById('holder'));
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
  }

  function renderPDF(pdfEncoded, canvasContainer, options) {
    var options = options || { scale: 1.5 };

    function renderPage(page) {
      let viewport = page.getViewport(options.scale);
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
      canvasContainer.appendChild(div);

      page.render(renderContext);
    }

    function renderPages(pdfDoc) {
      for (let num = 1; num <= pdfDoc.numPages; num++)
        pdfDoc.getPage(num).then(renderPage);
    }

    self.PDFJS.disableWorker = true;
    self.PDFJS.getDocument({
      data: pdfEncoded
    }).then(renderPages);
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
    base64Data: '<'
  }
})

module.exports.name = moduleName;