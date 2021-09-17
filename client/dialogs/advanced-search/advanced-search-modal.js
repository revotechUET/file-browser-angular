const helper = require('../dialog-helper');
require('./advanced-search-modal.less');
const utils = require('../../js/utils');

module.exports = function (ModalService, fileExplorerCtrl, callback) {
  modalController.$inject = ['$scope', 'close', 'wiApi', 'wiDialog', '$timeout'];

  function modalController($scope, close, wiApi, wiDialog, $timeout) {
    let self = this;
    let _toastr = window.__toastr || window.toastr;
    this.$onInit = function () {
      let idProject = fileExplorerCtrl.idProject ? fileExplorerCtrl.idProject : wiSession.getData('idProject');
      (async() => {
        self.wellsSelection = await wiApi.getWellsPromise(idProject);
        self.wellsSelection = _.orderBy(self.wellsSelection, [well => well.name.toLowerCase()], ['asc']);
        $timeout(() => {
          self.wellSelections = self.wellsSelection.map(well => ({
            data: {label: well.name},
            properties: {name: well.name}
          })
          )
          //self.wellSelections.unshift({
            //data: {label: ""},
            //properties: {name: ""}
          //});
        })
      })();
    }
    this.wellValidationFn = function(selectItem, index) {
      let md = self.conditions.find(md => md.mdtype == 'well');
      return md.children[index].well && md.children[index].submitted;
    }
    this.getWellName = function(well) {
      return (well.properties || {}).name || well;
    }
    this.onWellSelectionChange = function(selectedItem, index) {
      if (!selectedItem) return;
      let md = self.conditions.find(md => md.mdtype == 'well');
      $timeout(() => {
        md.children[index].well = typeof(selectedItem) === "string" ? selectedItem : (selectedItem || {}).properties.name;
      })
    }
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
      "block" : {
        type: 'taxonomies',
        label: "Block"
      },
      "field" : {
        type: 'taxonomies',
        label: "Field"
      },
      "well" : {
        type: 'taxonomies',
        label: "Well"
      },
      "welltype" : {
        type: 'taxonomies',
        label: "Well Type"
      },
      "datatype" : {
        type: 'select',
        label: "Data Type"
      }
    }
    this.getSelections = function (mdkey) {
      switch (mdkey) {
        case 'datatype':
          return utils.getSelections()[mdkey];
        default:
          return utils.getSelections()[self.mapKey[mdkey].label];
      }
    }
    try {
      self.customMdSource = $scope.$root.taxonomies['Custom Metadata'].map(i => i.item);
    } catch (e) {}
    // this.datatypes = utils.getSelections()['datatypes'];
    this.warning = '';
    this.searchQuery = angular.copy(fileExplorerCtrl.searchQuery);
    this.customArr = [];
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
          if (self.mapKey[keyObj]) {
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
          } else {
            let _customArr = child.children.filter(_children => {
              return Object.keys(_children)[0] == keyObj
            }).map(_children => {
              return {
                key: decodeURI(keyObj), value: _children[keyObj]
              }
            })
            self.customArr.push(..._customArr)
            // self.customArr.push({ key: decodeURI(keyObj), value: child.children[0][keyObj] });
          }
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
      if(key == 'custom') {
        self.customArr.push({key: '', value: ''});
        return;
      }
      if(idx > -1) {
        if(key != 'uploaded') self.conditions[idx].children.push({[key] : ''});
      }
      else {
        let children = (key == 'uploaded') ? [{[key] : {from: '', to: ''}}] : [{[key] : ''}];
        /*if (key == 'uploaded') children = [{[key] : {from: '', to: ''}}]
        else if (key == 'custom') children = [{'' : ''}]
        else children = [{[key] : ''}];*/
        self.conditions.push({
          mdtype: key,
          inputtype: self.mapKey[key].type,
          children: children
        });
      }
    };
    this.changeCustomFields = function(row, oPart, index) {
      self.customArr[index].key = row.key;
      self.customArr[index].value = row.value;
      console.log(self.customArr);
    }
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
    this.removeCustom = function(index) {
      self.customArr.splice(index, 1);
    }
    this.countMDRow = function (key) {
      if(key == 'custom') {
        if (self.customArr && self.customArr.length)
          return self.customArr.length;
        else return 0;
      } else {
        let metadata = self.conditions.find(c => c.mdtype == key);
        if (metadata && metadata.children && metadata.children.length)
          return metadata.children.length;
        else return 0;
      }
    }
    function conditionsToSearchQuery (conditions, customArr) {
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
      });
      // get custom fields to search
      let keys = _.uniq(customArr.map(item=>item.key)).filter(k => k!='');
      keys.forEach(field => {
        let children = [];
        for(let i=0; i < customArr.length; i++) {
          if(customArr[i].key == field) children.push({[field] : customArr[i].value})
        };
        searchQuery.conditions.children.push({
          operator: 'or',
          children: children
        });
      })
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
      return searchQuery;
    };
    function onSearch() {
      let newCustomArr = angular.copy(self.customArr);
      newCustomArr.forEach(custom => {
          custom.key = encodeURI(custom.key.toLowerCase());
      })
      self.searchQuery.subFolders = (self.subFolders) ? 'included' : 'excluded';
      fileExplorerCtrl.searchQuery = conditionsToSearchQuery(self.conditions, newCustomArr);
    }
    this.applySearch = function () {
      change2Submitted();
      if (_.isEmpty($scope.conditionsForm.$error)) {
        onSearch();
        callback('Ok');
      } else {
        _toastr ? _toastr.error(`Parameter(s) cannot be empty`) : console.log(`Parameter(s) cannot be empty`);
      }
    }
    this.okSearch = function () {
      change2Submitted();
      if (_.isEmpty($scope.conditionsForm.$error)) {
        onSearch();
        close('Ok');
      } else {
        _toastr ? _toastr.error(`Parameter(s) cannot be empty`) : console.log(`Parameter(s) cannot be empty`);
      }
    }
    this.closeModal = function () {
      close();
    }
    function change2Submitted() {
      self.conditions.forEach(md => {
        md.children.forEach(child => {
          child.submitted = true;
        })
      })
      self.customArr.forEach(field => {
        field.submitted = true;
      })
    }
    this.validateConditionsForm = function(inputName, inputObj) {
      return $scope.conditionsForm
        && $scope.conditionsForm[inputName].$error.required
        && inputObj.submitted;
    }
    this.loadedFilter = null;
    if (fileExplorerCtrl.modeFilter === "custom search") {
      this.loadedFilter = fileExplorerCtrl.__loadedFilter
    } else {
      delete fileExplorerCtrl.__loadedFilter;
    }
    this.loadFilter = function() {
      console.log("load filter");
      // fileExplorerCtrl.searchQuery = JSON.parse('{"type":"all","subFolders":"included","conditions":{"operator":"and","children":[{"operator":"or","children":[{"name":"1_1.las"}]}]}}');
      wiApi.listStorageFilterPromise()
      .then((res) => {
        console.log(res);
        let selectionList = res.map(i => {
          return {
            data: {
              label: i.name,
              idFilter: i.idFilter
            },
            properties: i // i.content
          }
        })
        selectionList.sort((a, b) => a.data.label.localeCompare(b.data.label));
        let config = {
          title: "Load Configuration",
          inputName: "Configuration Name",
          selectionList: selectionList,
          onCtrlBtnClick: function(item, e, wiDropdown) {
            console.log(item, e, wiDropdown);
            let index = wiDropdown.items.indexOf(item);
            wiDialog.confirmDialog("Delete filter?", "Are you sure?", function(res) {
              if(res) {
                wiApi.deleteStorageFilterPromise({idFilter: item.data.idFilter})
                .then(() => {
                  $timeout(() => {
                    wiDropdown.items.splice(index, 1);
                    wiDropdown.selectedItem = wiDropdown.items.length ? wiDropdown.items[0] : null
                  })
                })
              }
            })
          },
          hideButtonDelete: false,
          iconBtn: 'fa fa-times-circle line-height-1_5'
        }
        wiDialog.promptListDialog(config, function(selectItem) {
          console.log(selectItem);
          /*
          fileExplorerCtrl.searchQuery = JSON.parse(selectItem).query;
          self.conditions = JSON.parse(selectItem).conditions;
          self.customArr = JSON.parse(selectItem).customArr;
          self.searchQuery = JSON.parse(selectItem).searchQuery;
          self.subFolders = JSON.parse(selectItem).subFolders;
          */
          const parsedContent = JSON.parse(selectItem.content);
          fileExplorerCtrl.searchQuery = parsedContent.query;
          parsedContent.conditions.forEach(md => {
            if(md.mdtype === "uploaded") {
              md.children.forEach(c => {
                if(c.uploaded) {
                  c.uploaded.from ? c.uploaded.from = new Date(c.uploaded.from) : null;
                  c.uploaded.to ? c.uploaded.to = new Date(c.uploaded.to) : null;
                }
              })
            }
          })
          self.conditions = parsedContent.conditions;
          self.customArr = parsedContent.customArr;
          self.searchQuery = parsedContent.searchQuery;
          self.subFolders = parsedContent.subFolders;
          self.loadedFilter = selectItem;
          fileExplorerCtrl.__loadedFilter = selectItem;

          callback(null);
        });
      });
    }
    this.saveFilter = function() {
      console.log("save filter");
      onSearch();
      let config = {
        title: "Save Configuration",
        inputName: "Configuration Name",
        input: self.loadedFilter ? self.loadedFilter.name:""
      }
      //
      let cacheConditions = Object.assign([], self.conditions);
      cacheConditions.forEach(md => {
        if(md.mdtype === "uploaded") {
          md.children.forEach(c => {
            if(c.uploaded) {
              c.uploaded.from ? c.uploaded.from = new Date(c.uploaded.from) : null;
              c.uploaded.to ? c.uploaded.to = new Date(c.uploaded.to) : null;
            }
          })
        }
      })
      // Nam The write but yet apply
      wiDialog.promptDialog(config, function(name) {
        wiApi.listStorageFilterPromise()
        .then((res) => {
          let temp = res.find(c => c.name == name);
          if(temp) {
            wiDialog.confirmDialog("Confirm",
            `Config <b>"${name}"</b> already exists! Are you sure you want to replace it ?`,
            function(res) {
                if(res) {
                  wiApi.editStorageFilterPromise({
                    idFilter: temp.idFilter,
                    name: name,
                    content: JSON.stringify({
                      query: fileExplorerCtrl.searchQuery,
                      conditions: cacheConditions,
                      // conditions: self.conditions,
                      customArr: self.customArr,
                      searchQuery: self.searchQuery,
                      subFolders: self.subFolders
                    })
                  })
                  .then(res => {
                    console.log(res);
                    self.loadedFilter = res;
                    fileExplorerCtrl.__loadedFilter = res;
                    _toastr ? _toastr.success(`Save config successfully`) : console.log(`Save config successfully`);
                  })
                }
            })
            console.log("exist !");
          }else {
            wiApi.createStorageFilterPromise({
              name: name,
              content: JSON.stringify({
                query: fileExplorerCtrl.searchQuery,
                conditions: cacheConditions,
                // conditions: self.conditions,
                customArr: self.customArr,
                searchQuery: self.searchQuery,
                subFolders: self.subFolders
              })
            })
            .then((res) => {
              console.log(res);
              self.loadedFilter = res;
              _toastr ? _toastr.success(`Save config successfully`) : console.log(`Save config successfully`);
            })
          }
        });
      })
    }
    this.hideActionFilter = fileExplorerCtrl.hideActionFilter;
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
