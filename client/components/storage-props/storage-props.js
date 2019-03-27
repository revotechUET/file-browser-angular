require('./storage-props.less');

const moduleName = 'storage-props';
const componentName = 'storageProps';

function Controller($scope) {
  	let self = this;
  	// let config = wiComponentService.getComponent(wiComponentService.LIST_CONFIG_PROPERTIES)['storageItem'];
  	// let idProject = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED).idProject;
  	let config = {
        "name": {
            "translation": "Name",
            "option": "use",
            "section": "General",
            "typeSpec": null,
            "refSpec": null,
            "choices": null,
            "modelBy": null,
            "require": null,
            "func": null
        },
        "type": {
            "translation": "Type",
            "option": "readonly",
            "section": "General",
            "typeSpec": null,
            "refSpec": null,
            "choices": null,
            "modelBy": null,
            "require": null,
            "func": null
        },
        "size": {
            "translation": "Size",
            "option": "readonly",
            "section": "General",
            "typeSpec": null,
            "refSpec": null,
            "choices": null,
            "modelBy": null,
            "require": null,
            "func": null
        },
        "location": {
            "translation": "Location",
            "option": "readonly",
            "section": "General",
            "typeSpec": null,
            "refSpec": null,
            "choices": null,
            "modelBy": null,
            "require": null,
            "func": null
        },
        "source": {
            "translation": "Source",
            "option": "readonly",
            "section": "General",
            "typeSpec": null,
            "refSpec": null,
            "choices": null,
            "modelBy": null,
            "require": null,
            "func": null
        },
        "author": {
            "translation": "Author",
            "option": "readonly",
            "section": "General",
            "typeSpec": null,
            "refSpec": null,
            "choices": null,
            "modelBy": null,
            "require": null,
            "func": null
        },
        "uploaded": {
            "translation": "Date Uploaded",
            "option": "readonly",
            "section": "General",
            "typeSpec": "wiref",
            "refSpec": "time",
            "choices": null,
            "modelBy": null,
            "require": null,
            "func": null
        },
        "modified": {
            "translation": "Date Modified",
            "option": "readonly",
            "section": "General",
            "typeSpec": "wiref",
            "refSpec": "time",
            "choices": null,
            "modelBy": null,
            "require": null,
            "func": null
        },
        "field": {
            "translation": "Field",
            "option": "notuse",
            "section": "Information",
            "typeSpec": null,
            "refSpec": null,
            "choices": null,
            "modelBy": null,
            "require": null,
            "func": null
        },
        "well": {
            "translation": "Well",
            "option": "notuse",
            "section": "Information",
            "typeSpec": "wiselect",
            "refSpec": null,
            "choices": "wells",
            "modelBy": null,
            "require": null,
            "func": null
        },
        "welltype": {
            "translation": "Well Type",
            "option": "notuse",
            "section": "Information",
            "typeSpec": null,
            "refSpec": null,
            "choices": null,
            "modelBy": null,
            "require": null,
            "func": null
        },
        "parameter": {
            "translation": "Parameter",
            "option": "use",
            "section": "Information",
            "typeSpec": null,
            "refSpec": null,
            "choices": null,
            "modelBy": null,
            "require": null,
            "func": null
        },
        "datatype": {
            "translation": "Data Type",
            "option": "use",
            "section": "Information",
            "typeSpec": "wiselect",
            "refSpec": null,
            "choices": "datatypes",
            "modelBy": null,
            "require": null,
            "func": null
        },
        "quality": {
            "translation": "Quality",
            "option": null,
            "section": "Information",
            "typeSpec": null,
            "refSpec": null,
            "choices": null,
            "modelBy": null,
            "require": null,
            "func": null
        },
        "relatesto": {
            "translation": "Relates to",
            "option": "use",
            "section": "Hyperlink",
            "typeSpec": null,
            "refSpec": null,
            "choices": null,
            "modelBy": null,
            "require": null,
            "func": null
        },
        "description": {
            "translation": "Description",
            "option": "use",
            "section": "Description",
            "typeSpec": null,
            "refSpec": null,
            "choices": null,
            "modelBy": null,
            "require": null,
            "func": null
        },
        "undefinedfields": {
            "translation": "More Information",
            "option": "use",
            "section": "More Information",
            "typeSpec": "undefinedfields",
            "refSpec": null,
            "choices": null,
            "modelBy": null,
            "require": null,
            "func": null
        }
    }
  	this.sections = ['General', 'Information', 'Hyperlink', 'Description', 'More Information'];
  	this.selections = {
  		"datatypes" : [
  		"",
  		"Log",
		"Core",
		"Core Image, Thin Sections and SEM",
		"SCAL (Scalar and Array)",
		"Zone",
		"PVT (Fluid Analysis)",
		"DST (Formation Pressure Test)",
		"MDT (Formation Pressure Test)",
		"RFT (Formation Pressure Test)",
		"Completion Data",
		"Perforations",
		"Biostratigraphy",
		"Borehole seismic",
		"VSP",
		"Checkshot",
		"Production & Cased Hole",
		"PLT, Drawdowns",
		"Dipmeter",
		"Resisitivity Imaging tools (FMI, EMI etc)",
		"Acoustic Imaging tools (UBI, CBIL etc)",
		"MWD Images",
		"VDL",
		"Waveforms – NMR/Sonic/DSI",
		"Depth-based Images Autocar, Goniometry, CAT Scan",
		"Mud Log - Formation Evaluation Log",
		"Mud Weights, Temp, Resistivities",
		"Well Site Geologist encodings of lithologies",
		"ROP",
		"LWD - MWD",
		"Directional Surveys and Well Paths",
		"Drilling Reports",
		"Text",
		"Others"
	  	]
	  }

 	this.$onInit = function () {
	};
	this.fields = [];
	this.wells = [];
	this.$onChanges = function(changeObj) {
		if(changeObj.metaData) {
			// self.metaData = self.selectedItem.metaData;
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
			obj[section] = arr;
			obj['More Information'] = undefinedArr;
		});
		return obj;
	};

	function getMDProps (mdKey, configObj) {
		return mdProps = {
			name: mdKey,
			label: configObj.translation || mdKey,
			type: configObj.typeSpec || 'text',
			readonly: (configObj.option == 'readonly') ? true : false,
			value : self.metaData[mdKey],
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

	this.addMetaData = function() {
		let newKey = 'New Meta Data';
		/*if (self.fields['More Information']
				.find(f => f.name.toLowerCase() == encodingSpace(newKey.toLowerCase()))) {

		}*/
		self.fields['More Information'].push({
			name: encodingSpace(newKey),
			label: newKey,
			type: 'text',
			readonly: false,
			value: ''
		});
		self.metaData[encodingSpace(newKey)] = '';
    	if(self.updateMetadatFunc) self.updateMetadatFunc(self.metaData);
	}
	this.removeDataMeta = function(name) {
		self.fields['More Information'] = self.fields['More Information']
											.filter(function(e) { return e.name !== name; });
		delete self.metaData[name];
    	if(self.updateMetadatFunc) self.updateMetadatFunc(self.metaData);
	}
	this.updateMDName = function(newLabel, name, value) {
		let newName = encodingSpace(newLabel);
		delete self.metaData[name];
		self.metaData[newName] = value;
    	if(self.updateMetadatFunc) self.updateMetadatFunc(self.metaData);
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
        updateMetadatFunc : '<'
    }
});

module.exports.name = moduleName;