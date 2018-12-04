module.exports = function (ModalService, Upload, callback) {
    modalController.$inject = ['$scope', 'close'];
    function modalController($scope, close) {
        let self = this;

        this.uploadFileList = [];
        this.uploadUrl = '';

        this.addForUpload = function ($files) {
            console.log($files);
            self.uploadFileList = self.uploadFileList.concat($files);
        }

        this.removeFromUpload = function (index) {
            self.uploadFileList.splice(index, 1);
        }

        this.uploadFiles = function () {
            Upload.upload({
                url: self.uploadUrl,
                data: {
                    file: self.uploadFileList
                }
            }).then(function (resp) {
                console.log('Success ' + resp);
            }, function (resp) {
                console.log('Error status: ' + resp);
            });
        }

        this.closeModal = function () {
            close(null);
        }
    }

    ModalService.showModal({
        template: require('./upload-files-modal.html'),
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