const async = require('../../vendor/js/async.min');
const helper = require('../dialog-helper');
require('./bulk-edit-modal.css');

module.exports = function (ModalService, callback) {
  modalController.$inject = ['$scope', 'close'];

  function modalController($scope, close) {
    let self = this;

    self.metaData4All = {
      field: '',
      well: '{}',
      welltype: '',
      datatype: '',
      quality: '5',
      description: ''
    };
    self.chooseBox = {};
    Object.keys(self.metaData4All).forEach((item, index) => {
      self.chooseBox[item] = false;
    });
    this.updateMD4All = function (metaData) {
      self.metaData4All = metaData;
    }
    this.apply = function() {
      let result = {};
      for(let item in self.chooseBox) {
        if(self.chooseBox[item]) result[item] = self.metaData4All[item];
      };
      close(result);
    };
    this.closeModal = function () {
      close(null);
    }
  }

  ModalService.showModal({
    template: require('./bulk-edit-modal.html'),
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