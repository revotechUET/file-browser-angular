function initModal(modal) {
  modal.element.modal();
  $(modal.element).prop('tabindex', 1);
  const elem = $(modal.element).find('.modal-content');
  setTimeout(() => {
      elem.find('.modal-header').css('cursor', 'move');
      const offsetWidth = elem.width()/3;
      const offsetHeight = elem.height()/3;
      elem.draggable({
          containment:[-2*offsetWidth, -10, window.innerWidth-offsetWidth, window.innerHeight-offsetHeight],
          handle: '.modal-header'
      });
      $(modal.element[0]).find('input').focus();
  }, 700);
  $(modal.element).keydown(function (e) {
      if (e.ctrlKey || e.shiftKey || e.altKey) return;
      if (e.keyCode == $.ui.keyCode.ENTER || e.keyCode == $.ui.keyCode.ESCAPE) {
          let okButton, cancelButton;
          let buttonElems = $(modal.element).find('.modal-footer > button');
          for (let i = 0; i < buttonElems.length; i++) {
              if (buttonElems[i].innerText.toLowerCase().trim() == 'ok'
                  || buttonElems[i].innerText.toLowerCase().trim() == 'close'
                  || buttonElems[i].type === 'submit'
              ) {
                  okButton = buttonElems[i];
              }
              if (buttonElems[i].innerText.toLowerCase().trim() == 'cancel') {
                  cancelButton = buttonElems[i];
              }
          }
          if (e.keyCode == $.ui.keyCode.ENTER && okButton) {
              e.preventDefault();
              e.stopPropagation();
              okButton.click();
          }
          if (e.keyCode == $.ui.keyCode.ESCAPE && cancelButton) cancelButton.click();
      }
  });
}
exports.initModal = initModal;

exports.removeBackdrop = function () {
  $('.modal-backdrop').last().remove();
  $('body').removeClass('modal-open');
}