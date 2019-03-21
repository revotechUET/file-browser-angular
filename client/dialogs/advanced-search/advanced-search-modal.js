const helper = require('../dialog-helper');
require('./advanced-search-modal.css');

module.exports = function (ModalService, fileExplorerCtrl, callback) {
  modalController.$inject = ['$scope', 'close'];

  function modalController($scope, close) {
    console.log(fileExplorerCtrl);
    let self = this;
    this.conditions = {};
    this.subFolders = false;
    this.type = 'all';
    this.insertMetaDataKey = function (searchBy) {
      self.conditions[searchBy].push(null);
    }
    this.isDisabledApplyBtn = function () {
      if(Object.keys(getValidConditions()).length) return false;
      else return true;
    }
    function getValidConditions () {
      let ret = { 
        subFolders: self.subFolders == true ? 'included' : 'excluded',
        type: self.type,
        conditions: {
          operator: 'and',
          children: []
        }
      };
      for (let md in self.conditions) {
        if( self.conditions[md] != null )
          ret.conditions.children.push({ [md] : self.conditions[md] });
      }
      return ret;
    }
    this.testFunc = function(val) {
      console.log(val);
    } 

    this.applySearch = function () {
      close(getValidConditions());
      // close();
    }
    this.closeModal = function () {
      close(null);
    }
  }

  ModalService.showModal({
    template: require('./advanced-search-modal.html'),
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