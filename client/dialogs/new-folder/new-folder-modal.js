module.exports = function (ModalService, fileExplorerCtrl, callback) {
  modalController.$inject = ['$scope', 'close'];
  function modalController($scope, close) {
    let self = this;
    this.newFolderUrl = fileExplorerCtrl.newFolderUrl;

    this.folderName = '';

    this.createFolder = function () {
      let queryStr = `dest=${encodeURIComponent(fileExplorerCtrl.rootFolder + fileExplorerCtrl.currentPath.join('/'))}&name=${encodeURIComponent(self.folderName)}`;

      fileExplorerCtrl.httpGet(self.newFolderUrl + queryStr, res => {
        console.log(res);
        close(null);
        fileExplorerCtrl.goTo(fileExplorerCtrl.currentPath.length - 1);
      })
    }

    this.closeModal = function () {
      close(null);
    }
  }

  ModalService.showModal({
    template: require('./new-folder-modal.html'),
    controller: modalController,
    controllerAs: 'self'
  }).then((modal) => {
    modal.element.modal();
    modal.close.then(data => {
      $('.modal-backdrop').last().remove();
      $('body').removeClass('modal-open');
      if (callback)
        callback(data);
    })
  })
}