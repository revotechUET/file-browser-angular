require('./storage-props.less');

const moduleName = 'storage-props';
const componentName = 'storageProps';

const utils = require('../../js/utils');
const metadataDialog = require('../../dialogs/metadata/metadata-modal');
const addMetadataDialog = require('../../dialogs/add-metadata/add-metadata-modal');
const selectWellDialog = require('../../dialogs/select-well/select-well-modal');
const getType = require('../../js/utils').getType;
const formatBytes = require('../../js/utils').formatBytes;
//const isFolder = require('../../js/utils').isFolder;
//const getFileExtension = require('../../js/utils').getFileExtension;


Controller.$inject = ['$scope', '$filter', 'ModalService', 'wiSession', '$timeout', '$http'];

const PROCESSING_STATUS = '/action/status?key=';

function Controller($scope, $filter, ModalService, wiSession, $timeout, $http) {
  	let self = this;
	const toastr = window.__toastr || window.toastr;
	//this.getSizeKey = null;
	this.checkFolderSizeProcess = null;
  	// let config = wiComponentService.getComponent(wiComponentService.LIST_CONFIG_PROPERTIES)['storageItem'];
  	// let idProject = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED).idProject;
  	let config = utils.getConfigProps();
	this.sections = ['Version History', 'General', 'Information', 'Description', 'More Information'];
  	this.selections = utils.getSelections();
 	this.$onInit = function () {
		self.statusUrl = self.apiUrl + PROCESSING_STATUS;
		self.revMetadataUrl = self.apiUrl + '/action/info';
		//console.log('self: ', self);
	};
	this.fields = [];
	this.wells = [];
	this.$onChanges = function(changeObj) {
		//console.log('changeObj:', changeObj);
		self.folderSize = null;
		//self.getSizeKey = null;
		if (self.checkFolderSizeProcess) {
			clearTimeout(self.checkFolderSizeProcess);
			self.checkFolderSizeProcess = null;
		}
		//self.loadingFolderSize = false;
		if (changeObj.metaData) {
 			self.fields = self.getMDObj();
		}

	};

	this.httpGet = function (url, cb, options = {}) {
		if (!options.silent) {
			self.requesting = true;
		}
		let reqOptions = {
			method: 'GET',
			url: url,
			headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': 'http://127.0.0.1:5000',
			'Access-Control-Allow-Credentials': 'true',
			'Referrer-Policy': 'no-referrer',
			'Authorization': window.localStorage.getItem('token'),
			'Storage-Database': JSON.stringify(self.storageDatabase),
			'Service': (options || {}).service || 'WI_PROJECT_STORAGE'
			}
		};
    $http(reqOptions).then(result => {
      if (!options.silent) {
        self.requesting = false;
        if (result.data && result.data.error) {
          toastr.error(result.data.message || 'Unknown error');
        }
      }
      cb(result);
    }, err => {
      console.error("file browser error", err);
      if (error.data && err.data.code === 401) location.reload();
      if (!options.silent) {
        self.requesting = false;
        toastr.error('Error connecting to server');
      }
      cb(null, err);
    });
	};

	this.getMDObj = function () {
		Object.assign(config, self.customConfigs || {});
		let obj = {};
		self.sections.forEach(function (section) {
			let arr = [];
			let undefinedArr = [];
			for (let key in self.metaData) {
				if (config[key] && config[key].section && config[key].section == section)
					arr.push(getMDProps(key, config[key]));
				else if (!config[key]) undefinedArr.push({
					name: key,
					label: decodingSpace(key),
					type: 'text',
					readonly: self.viewOnly,
					value: self.metaData[key]
				});
			}
			arr = mapOrder(arr, Object.keys(config), 'name');
			obj[section] = arr;
			obj['More Information'] = undefinedArr;
		});
		obj['Version History'] = self.revision ? self.revision.map(rev => {
			const md = {
				name: rev.time,
				label: moment(parseInt(rev.time)).format('YYYY/MM/DD HH:mm'),
				type: 'wirevision',
				value: $filter('humanReadableFileSize')(rev.size),
				readonly: true,
				use: true,
				onSelect: () => {},
				onDblClick: () => {
					self.dblclickRevisionFunc({ ...self.item, path: self.item.path + `__WI__/${rev.time}` });
				},
			}
			return md;
		}) : [];
		if (getMDProps('associate', config['associate'])) obj['Information'].push(getMDProps('associate', config['associate']));
		//console.log("OBJ: ", obj);
		return obj;
	};
	self.revisionMetadata = function (revision) {
		self.httpGet(self.revMetadataUrl + `?file_path=${self.item.path}&revision=${revision.name}`, res => {
			if (!res) return;
			metadataDialog(ModalService, res.data.Metadata, revision.label);
		})
	};
	self.restoreRevision = function (revision) {
		if (!confirm('Are you sure you want to restore to this version?')) return;
		self.restoreRevisionFunc(revision);
		self.revision = self.revision ? self.revision.filter(v => v.time !== revision.name) : [];
		self.fields = self.getMDObj();
	};
	self.removeRevision = function (revision) {
		if (!confirm('Are you sure you want to delete this version?')) return;
		self.removeRevisionFunc(revision);
		self.revision = self.revision ? self.revision.filter(v => v.time !== revision.name) : [];
		self.fields = self.getMDObj();
	};
	function mapOrder (array, order, key) {
		array.sort( function (a, b) {
		    var A = a[key], B = b[key];
		    
		    if (order.indexOf(A) > order.indexOf(B)) {
		        return 1;
		    } else {
		        return -1;
		    }
		    
		  });
		  
		return array;
	};
	function getMDProps (mdKey, configObj) {
		if(!self.readonlyValues) self.readonlyValues = [];
		if(!self.metaData || (mdKey == 'associate' && !self.enableAssociate)) return;
		let value = self.metaData[mdKey];
		let name = self.metaData['name'];
		// if(mdKey == 'size') value = $filter('humanReadableFileSize')(self.metaData[mdKey]);
		try {
			if (mdKey == 'relatesto' || mdKey == 'well') value = (self.metaData[mdKey] == '') ? {} : JSON.parse(self.metaData[mdKey]);
		} catch (e) {
			console.warn("JSON.parse error when get MD props. Consider to fix it later", e);
		}
		if(mdKey == 'associate') value = self.metaData;
		let readonly = (configObj.option == 'readonly' || self.readonlyValues.find(k => k==mdKey)) ? true : false;
		return mdProps = {
			name: mdKey,
			label: configObj.translation || mdKey,
			type: configObj.typeSpec || 'text',
			readonly: self.viewOnly || readonly,
			value : mdKey == "type" ? (self.isFolder ? "Folder" : getType(name)) : value,
			use: (configObj.option == 'notuse') ? false : true,
			ref: getRef(configObj.refSpec, mdKey),
			selections: configObj.choices ? self.selections[configObj.choices] : []
		}
	}

	function getRef (refSpec, mdKey) {
		let ref = null;
		switch(refSpec) {
			case 'time' :
				let date = new Date(self.metaData[mdKey]).getTime();
				if (isNaN(date)) {
					date = parseInt(self.metaData[mdKey])
				}
				ref = moment(date).format('YYYY/MM/DD hh:mm:ss A');
				break;
			case 'size' :
				ref = $filter('humanReadableFileSize')(self.metaData[mdKey]);
				break;
			default: 
		}
		return ref;
	}

	this.estimateFolderSize = function() {
		//console.log(self.getSize);
		self.checkFolderSizeProcess = setTimeout(() => {});
		self.getSize().then((rs)=>{
			let key = rs.key;
			// $timeout(()=>{
			// 	self.folderSize = formatBytes(rs, 3);
			// 	self.loadingFolderSize = false;
			// });

			//trigger check key

			let triggerFn = ()=>{
				self.httpGet(self.statusUrl + key, (rs)=>{
					rs = rs.data;
					//console.log(rs);
					if (rs.status == 'IN_PROGRESS') {
						self.checkFolderSizeProcess = setTimeout(triggerFn, 2000);
					} else {
						if (rs.info) {
							self.folderSize = formatBytes(rs.info , 3);
							self.checkFolderSizeProcess = null;
						}
					}
				}, { silent: true })
			}
			self.checkFolderSizeProcess = setTimeout(triggerFn, 1500);
		})
	}

	this.checkMDObj = function (section) {
		if (!self.metaData || self.metaData == {}) return false;
		if (!self.fields[section] || !self.fields[section].length) return false;
		else return true;
	}
    this.updateMetaData = function (name, value) {
    	if(self.metaData[name] == value) return;
    	if(name == 'name' && value == '') {
    		let findFieldIdx = self.fields['General'].findIndex(f => f.name == 'name');
    		self.fields['General'][findFieldIdx].value = self.metaData[name];
    		return;
    	}
    	self.metaData[name] = value;
    	if(self.updateMetadatFunc) self.updateMetadatFunc(self.metaData);
	};
	function findWellheader (headerName, well) {
		let value = '';
		if(well) {
			let header = well.well_headers.find(h => h.header == headerName);
			if (header) value = header.value;
		}

		return value;
	}
	this.onChangeSelect = function (name, value) {
		if(name == 'well') {
			let selectedWell = self.wells.find(w => w.name == value);
			self.fields['Information'].forEach(md => {
				if(md.name == 'field') {
					md.value = findWellheader('FLD', selectedWell);
					self.metaData[md.name] = md.value;
				}
				if(md.name == 'block') {
					md.value = findWellheader('BLOCK', selectedWell);
					self.metaData[md.name] = md.value;
				}
				if(md.name == 'welltype') {
					md.value = findWellheader('WTYPE', selectedWell);
					self.metaData[md.name] = md.value;
				}
			});
		}
		self.updateMetaData(name, value);
	}
	function encodingSpace (label) {
		return label.replace(/ /g, "%20");
	}
	function decodingSpace (name) {
		return name.replace(/%20/g, " ");
	}
	function getRandomKey () {
		let newKey = randomKeys[Math.floor(Math.random() * randomKeys.length)];
		randomKeys = randomKeys.filter(e => { return e !== newKey });
		return newKey;
	};
	function checkValidKey (keyName) {
		let valid = true;
		for(let key in self.metaData) {
			if(key.toLowerCase() == keyName.toLowerCase()) valid = false;
		}
		return valid;
	}
	$scope.flag = true;
	self.checkName = function (md, oldValue) {
		if(md.name == 'name') {
			if(!utils.validateNodeName(md.value)) {
				toastr.error(`File name can not contain special characters except for !-_.'"()`);
				md.value = oldValue;
			}
		}
	}
	this.addMetaData = function() {
		addMetadataDialog(ModalService, self.metaData, function(md) {
			if(md) {
				self.fields['More Information'].push({
					name: md.name,
					label: decodingSpace(md.name),
					type: 'text',
					readonly: false,
					value: md.value
				});
				self.metaData[md.name] = md.value;
		    	if(self.updateMetadatFunc) self.updateMetadatFunc(self.metaData);
			}
		});
	}
	this.removeDataMeta = function(name) {
		self.fields['More Information'] = self.fields['More Information']
											.filter(function(e) { return e.name !== name; });
		delete self.metaData[name];
    	if(self.updateMetadatFunc) self.updateMetadatFunc(self.metaData);
	}
	this.updateMDName = function(newLabel, name, value) {
		let newName = encodingSpace(newLabel);
		if(newName == name) return;
		if(!checkValidKey(newName)) {
			self.warning = "Meta data's key existed!";
			return;
		}
		delete self.metaData[name];
		self.metaData[newName] = value;
    	if(self.updateMetadatFunc) self.updateMetadatFunc(self.metaData);
	}
	this.copyLocation = function(value) {
		wiSession.putData('location', JSON.stringify({option: 'single', value: value}));
	}
	function setValue (key) {
		self.fields['Information'].forEach(md => {
			if(md.name == key) {
				md.value = self.metaData[key];
			}
		});
	}
	this.pasteObject = function(md, key) {
		let object = JSON.parse(wiSession.getData('objectNode'));
		if(!object) return;
		if(key == 'well' && object.type !== 'well') return;
		md.value = {
			type: object.type,
			name: object.properties.name,
			id: object.id,
			icon: object.data.icon
		};
		self.metaData[md.name] = JSON.stringify(md.value);
		if(md.name == 'well') {
			if(md.value.type == 'well') {
				function getWellheaderByKey(wellProps, key) {
					const wellheader = wellProps.wellheaders.find(wh => wh.header == key) || {};
					let value = wellheader.value;
					return value || '';
				}
				self.metaData.field = getWellheaderByKey(object.properties, 'FLD');
				self.metaData.block = getWellheaderByKey(object.properties, 'BLOCK');
				self.metaData.welltype = getWellheaderByKey(object.properties, 'WTYPE');
			} else {
				self.metaData.field = '';
				self.metaData.block = '';
				self.metaData.welltype = '';
			}
		}
		setValue('field');
		setValue('block');
		setValue('welltype');
    	if(self.updateMetadatFunc) self.updateMetadatFunc(self.metaData);
	}
	this.onChangeBox = function(check, md) {
		if(md.name != 'well') return;
		self.chooseBox.field = check;
		self.chooseBox.welltype = check;
	}
	this.visitNode = function(obj) {
		if(!obj || !obj.value) return;
		window.explorertreeview.scrollToNode(obj.value);
	}
	this.associateToNodes = function (md) {
		window.explorertree.filterByFile(md.value.location);
	}
	this.clearObject = function(md) {
		if(!md || !md.value) return;
		md.value = {};
		self.metaData.field = '';
		self.metaData.welltype = '';
		setValue('field');
		setValue('welltype');
		self.metaData[md.name] = JSON.stringify(md.value);
    	if(self.updateMetadatFunc) self.updateMetadatFunc(self.metaData);
	}
	this.locationCopied = function(location) {
		let locations = JSON.parse(wiSession.getData('location'));
		if(locations && locations.value == location) return true;
		else return false;
	};
	this.doRating = function (md, index) {
		md.value = index;
		self.updateMetaData(md.name, index +'' );
	}
	this.selectWell = function (md) {
		selectWellDialog(ModalService, md.value.id, function (selectedNode) {
			const bakObjectNode = wiSession.getData('objectNode');
			wiSession.putData('objectNode', JSON.stringify(selectedNode));
			self.pasteObject(md, 'well');
			wiSession.putData('objectNode', bakObjectNode);
		})
	}
}

let app = angular.module(moduleName, []);

app.component(componentName, {
	template: require('./storage-props.html'),
	controller: Controller,
	controllerAs: 'self',
	transclude: true,
	bindings: {
		metaData: '<',
		revision: '<',
		updateMetadatFunc: '<',
		item: '<',
		dblclickRevisionFunc: '<',
		removeRevisionFunc: '<',
		restoreRevisionFunc: '<',
		hideHeader: '<',
		readonlyValues: '<',
		shortView: '<',
		chooseBox: '<',
		enableAssociate: '<',
		hideAssociate: '<',
		customConfigs: '<',
		isFolder: '<',
		getSize: '<',
		apiUrl: '<',
		storageDatabase: '<',
		viewOnly: '<',
	}
});
app.directive('spEnter', ['$parse', function ($parse) {
    return function (scope, element, attrs) {
        let fn = $parse(attrs['spEnter']);
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    event.preventDefault();
                    fn(scope, {$event: event});
                });
            }
        });
    };
}]);
module.exports.name = moduleName;
