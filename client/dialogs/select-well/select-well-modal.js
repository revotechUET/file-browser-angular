const helper = require('../dialog-helper');
const utils = require('../../js/utils');

module.exports = function (ModalService, idWell, callback) {
  modalController.$inject = ['close'];
  function modalController(close, $timeout) {
    if (!window.explorertree) {
      close(null);
      return;
    }
    const self = this;
    const treeConfig = window.explorertree.treeConfig[0];
    this.wellConfig = utils.getAllWellsInNode(treeConfig).map(n => ({ ...n }));
    if (idWell) {
      const selectedNode = this.wellConfig.find(n => n.properties.idWell === idWell)
      selectedNode && setSelectedWellNode(selectedNode);
    }

    this.getLabel = function (node) {
      return (node || {}).data.label || '';
    }
    this.getIcon = function (node) {
      if (!node) return;
      return (node || {}).data.icon || '';
    }
    this.runMatch = function (node, filter) {
      return node.name.includes(filter.toLowerCase()) || node.name.includes(filter.toUpperCase());
    }
    this.getChildren = function (node) {
      return [];
    }

    function setSelectedWellNode(node) {
      self.selectedWell = node;
      self.wellConfig.forEach(function (n) {
        n._selected = false;
        if (n.id === node.id) n._selected = true;
      });
    }
    this.clickWell = function (events, node, selectedIds) {
      setSelectedWellNode(node);
    }


    this.onOkButtonClicked = function () {
      close(self.selectedWell);
    }
    this.onCancelButtonClicked = function () {
      close(null);
    }
  }
  ModalService.showModal({
    template: require('./select-well-modal.html'),
    controller: modalController,
    controllerAs: 'self'
  }).then(function (modal) {
    helper.initModal(modal);
    modal.close.then(function (data) {
      helper.removeBackdrop();
      if (data) {
        callback(data);
      }
    })
  })
}