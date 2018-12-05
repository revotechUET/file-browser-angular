module.exports = function (ModalService, Upload, async, url, callback) {
    modalController.$inject = ['$scope', 'close'];
    function modalController($scope, close) {
        let self = this;

        this.uploadFileList = [];
        this.uploadUrl = url;

        this.addForUpload = function ($files) {
            self.uploadFileList = self.uploadFileList.concat($files);
        }

        this.removeFromUpload = function (index) {
            self.uploadFileList.splice(index, 1);
        }

        this.uploadFiles = function () {
            // console.log(self.uploadUrl);
            async.each(self.uploadFileList, (file, next) => {
                Upload.upload({
                    url: self.uploadUrl,
                    data: {
                        'upload-file': file
                    }
                }).then(resp => {
                    console.log('Success ' + resp);
                    next();
                }, resp => {
                    console.log('Error status: ' + resp);
                    next();
                });
            }, err => {
                if (!err) {
                    console.log('===upload files done');
                }
            })
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