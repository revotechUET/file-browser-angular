const helper = require('../dialog-helper');
require('./advanced-search-modal.css');
const utils = require('../../js/utils');

module.exports = function (ModalService, fileExplorerCtrl, callback) {
  modalController.$inject = ['$scope', 'close'];

  function modalController($scope, close) {
    let self = this;
    this.mapKey = {
      "name" : {
        type: 'text',
        label: "File Name"
      }, 
      "type" : {
        type: 'text',
        label: "File Type"
      },
      "author" : {
        type: 'text',
        label: "Author"
      },
      "uploaded" : {
        type: 'date',
        label: "Date Uploaded"
      },
      "field" : {
        type: 'text',
        label: "Field"
      },
      "well" : {
        type: 'text',
        label: "Well"
      },
      "welltype" : {
        type: 'text',
        label: "Well Type"
      },
      "datatype" : {
        type: 'select',
        label: "Data Type"
      }
    }
    this.datatypes = utils.getSelections()['datatypes'];
    this.warning = '';
    this.searchQuery = angular.copy(fileExplorerCtrl.searchQuery);
    console.log('**', getTableConditions(this.searchQuery));
    this.conditions = getTableConditions(this.searchQuery);
    this.subFolders = this.searchQuery.subFolders == 'included' ? true : false;
    this.getKeyObj = function (obj) {
      return Object.keys(obj)[0];
    }
    this.getLabel = function (childObj) {
      let key = Object.keys(childObj.children[0])[0];
      return self.mapKey[key].label;
    }
    function getTableConditions (searchQuery) {
      let conditions = [];
      searchQuery.conditions.children.forEach(function(child) {
        if(child.children && child.children.length) {
          let keyObj = Object.keys(child.children[0])[0];
          let children = [];
          if(keyObj == 'uploaded') children = child.children.map(item => {
                                          let rObj = {};
                                          if(item.uploaded) {
                                            rObj[keyObj] = {};
                                            rObj[keyObj].from = new Date(item.uploaded.from);
                                            rObj[keyObj].to = new Date(item.uploaded.to);
                                          }
                                          return rObj;
                                        });
          else children = child.children;
          conditions.push({
            mdtype: keyObj,
            inputtype: self.mapKey[keyObj].type,
            children: children
          });
        }
      });
      return conditions;
    }
    let selectedArr = [];
    this.rowSelected = function (child) {
      let idx = self.conditions.findIndex(function(d) {
        return d == child;
      });
      return selectedArr[idx];
    }
    this.selectItem = function (child) {
      for (let idx = 0; idx < selectedArr.length; idx++) {
        selectedArr[idx] = false;
      }
      let idx = self.searchQuery.conditions.children.findIndex(function(d) {
        return d == child;
      });
      selectedArr[idx] = true;

    }
    this.insertMetaDataKey = function (key) {
      let idx = self.conditions.findIndex(d => d.mdtype == key);
      if(idx > -1) {
        if(key != 'uploaded') self.conditions[idx].children.push({[key] : ''});
      }
      else {
        let children = (key == 'uploaded') ? [{[key] : {from: '', to: ''}}] : [{[key] : ''}]
        self.conditions.push({
          mdtype: key,
          inputtype: self.mapKey[key].type,
          children: children
        });
      }
    };

    this.removeMetaData = function (key, child) {
      let mdSelect = self.conditions.find(d => d.mdtype == key);
      let  idx = self.conditions.findIndex(d => d.mdtype == key);
      if (mdSelect && mdSelect.children && mdSelect.children.length == 1) {
        self.conditions.splice(idx, 1);
        return;
      }
      let childIdx = self.conditions[idx].children
                                .findIndex(c => c == child);
      self.conditions[idx].children
                          .splice(childIdx, 1);
    }
    this.countMDRow = function (key) {
      let metadata = self.conditions.find(c => c.mdtype == key);
      if (metadata && metadata.children && metadata.children.length) 
        return metadata.children.length;
      else return 0;
    }
    function conditionsToSearchQuery (conditions) {
      let searchQuery = {
        type: self.searchQuery.type,
        subFolders: (self.subFolders) ? 'included' : 'excluded',
        conditions: {
          operator: 'and',
          children: []
        }
      };
      conditions.forEach(function(c) {
        if(c.children && c.children.length) {
          if(getChildren(c) && getChildren(c).length)
            searchQuery.conditions.children.push({
              operator: 'or',
              children: getChildren(c)
            });
        }
        function getChildren (condition) {
          let children = [];
          condition.children
                    .forEach(item => {
                      let rObj = {};
                      let mdtype = condition.mdtype;
                      if(item[mdtype] && item[mdtype] != '') {
                        if(condition.inputtype == 'date') {
                          rObj[mdtype] = {};
                          if((item[mdtype].from != '') && (item[mdtype].to != '')) {
                            rObj[mdtype].from = new Date(item[mdtype].from).getTime();
                            rObj[mdtype].to = new Date(item[mdtype].to).getTime();
                          } else if ((item[mdtype].from != '') && (item[mdtype].to == '')) {
                            rObj[mdtype].from = new Date(item[mdtype].from).getTime();
                            rObj[mdtype].to = new Date(item[mdtype].from).getTime();
                          } else {}
                        } 
                        else rObj[condition.mdtype] = item[condition.mdtype];
                        if (rObj != {}) children.push(rObj);
                      };
                    });
          return children;
        };
      });
      return searchQuery;
    };
    function onSearch() {
      self.searchQuery.subFolders = (self.subFolders) ? 'included' : 'excluded';
      fileExplorerCtrl.searchQuery = conditionsToSearchQuery(self.conditions);
    }
    this.applySearch = function () {
      onSearch();
      callback('Ok');
    }
    this.okSearch = function () {
      onSearch();
      close('Ok');
    }
    this.closeModal = function () {
      close();
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