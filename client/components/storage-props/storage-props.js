require('./storage-props.less');

const moduleName = 'storage-props';
const componentName = 'storageProps';

const utils = require('../../js/utils');
const addMetadataDialog = require('../../dialogs/add-metadata/add-metadata-modal');

Controller.$inject = ['$scope', '$filter', 'ModalService', 'wiSession'];

function Controller($scope, $filter, ModalService, wiSession) {
  	let self = this;
  	// let config = wiComponentService.getComponent(wiComponentService.LIST_CONFIG_PROPERTIES)['storageItem'];
  	// let idProject = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED).idProject;
  	let config = utils.getConfigProps();
  	this.sections = ['General', 'Information', 'Hyperlink', 'Description', 'More Information'];
  	this.selections = utils.getSelections();
 	this.$onInit = function () {
	};
	this.fields = [];
	this.wells = [];
	this.$onChanges = function(changeObj) {
		if(changeObj.metaData) {
 			/*console.log(self.getMDObj());
 			wiApiService.listWells({idProject: idProject}, function(wells) {
 				self.wells = wells;
 				self.selections.wells = wells.map(w => w.name);
 				self.selections.wells.unshift("");
 			});*/
 			self.fields = self.getMDObj();
		}
	};
	this.getMDObj = function() {
		let obj = {};
		self.sections.forEach(function(section) {
			let arr = [];
			let undefinedArr = [];
			for(let key in self.metaData) {
				if(config[key] && config[key].section && config[key].section == section) 
					arr.push(getMDProps(key, config[key]));
				else if(!config[key]) undefinedArr.push({
					name: key,
					label: decodingSpace(key),
					type: 'text',
					readonly: false,
					value: self.metaData[key]
				});
			};
			arr = mapOrder(arr, Object.keys(config), 'name');
			obj[section] = arr;
			obj['More Information'] = undefinedArr;
		});
		return obj;
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
		let value = self.metaData[mdKey];
		if(mdKey == 'size') value = $filter('humanReadableFileSize')(self.metaData[mdKey]);
		if(mdKey == 'well') value = JSON.parse(self.metaData[mdKey]);
		return mdProps = {
			name: mdKey,
			label: configObj.translation || mdKey,
			type: configObj.typeSpec || 'text',
			readonly: (configObj.option == 'readonly' || self.readonlyValues.find(k => k==mdKey)) ? true : false,
			value : value,
			use: (configObj.option == 'notuse') ? false : true,
			ref: getRef(configObj.refSpec, mdKey),
			selections: configObj.choices ? self.selections[configObj.choices] : []
		}
	}

	function getRef (refSpec, mdKey) {
		let ref = null;
		switch(refSpec) {
			case 'time' :  
				ref = moment(parseInt(self.metaData[mdKey])).format('YYYY/MM/DD hh:mm:ss');
				break;
			default: 
		}
		return ref;
	}
	this.checkMDObj = function () {
		if(!self.metaData || self.metaData == {}) return false;
		else return true;
	}
    this.updateMetaData = function (name, value) {
    	if(self.metaData[name] == value) return;
    	self.metaData[name] = value;
    	if(self.updateMetadatFunc) self.updateMetadatFunc(self.metaData);
	};
	this.onChangeSelect = function (name, value) {
		if(name == 'well') {
			let selectedWell = self.wells.find(w => w.name == value);
			function findWellheader (headerName, well) {
				let value = '';
				if(well) {
					let header = well.well_headers.find(h => h.header == headerName);
					if (header) value = header.value;
				}

				return value;
			}
			self.fields['Information'].forEach(md => {
				if(md.name == 'field') {
					md.value = findWellheader('FLD', selectedWell);
					self.metaData[md.name] = md.value;
				}
				if(md.name == 'welltype') {
					md.value = findWellheader('TYPE', selectedWell);
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
	self.checkNameMess = '';
	$scope.flag = true;
	self.checkName = function (md, oldValue) {
		if(md.name == 'name') {
			let format = /[\/:*?"><|]/;
			if(format.test(md.value)) {
				self.checkNameMess = "A file name can't contain any of the following characters: \/:*?\"><|";
				setTimeout(function() {
					md.value = oldValue;
					self.checkNameMess = '';
				}, 3000)
			} else self.checkNameMess = '';
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
		wiSession.putData('location', value);
	}
	this.pasteWell = function(md) {
		let wellNode = JSON.parse(wiSession.getData('wellNode'));
		md.value = {
			name: wellNode.properties.name,
			idWell: wellNode.properties.idWell
		};
		self.metaData[md.name] = JSON.stringify(md.value);
		function getWellheaderByKey(wellProps, key) {
			return wellProps.wellheaders.find(wh => wh.header == key).value;
		}
		function setValue (key) {
			self.fields['Information'].forEach(md => {
				if(md.name == key) {
					md.value = self.metaData[key];
				}
			});
		}
		self.metaData.field = getWellheaderByKey(wellNode.properties, 'FLD');
		self.metaData.welltype = getWellheaderByKey(wellNode.properties, 'TYPE');
		setValue('field');
		setValue('welltype');
    	if(self.updateMetadatFunc) self.updateMetadatFunc(self.metaData);
	}
	this.visitNode = function(obj) {
		if(!obj || !obj.id) return;
		window.basetreeview.scrollToNode(obj);
	}
}

let app = angular.module(moduleName, []);

app.component(componentName, {
    template: require('./storage-props.html'),
    controller: Controller,
    controllerAs: 'self',
    transclude: true,
    bindings: {
        metaData : '<',
        updateMetadatFunc : '<',
        hideHeader: '@',
        readonlyValues: '<'
    }
});
app.directive('spEnter', function ($parse) {
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
});
module.exports.name = moduleName;