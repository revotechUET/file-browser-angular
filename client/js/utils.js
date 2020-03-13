exports.getConfigProps = function() {
	return {
        "name": {
            "translation": "Name",
            "option": "use",
            "section": "General",
            "typeSpec": null,
            "refSpec": null,
            "choices": null
        },
        "type": {
            "translation": "Type",
            "option": "readonly",
            "section": "General",
            "typeSpec": null,
            "refSpec": null,
            "choices": null  
        },
        "size": {
            "translation": "Size",
            "option": "readonly",
            "section": "General",
            "typeSpec": "wiref",
            "refSpec": "size",
            "choices": null
        },
        "location": {
            "translation": "Location",
            "option": "readonly",
            "section": "General",
            "typeSpec": null,
            "refSpec": null,
            "choices": null
        },
        "source": {
            "translation": "Source",
            "option": "readonly",
            "section": "General",
            "typeSpec": null,
            "refSpec": null,
            "choices": null
        },
        "author": {
            "translation": "Author",
            "option": "readonly",
            "section": "General",
            "typeSpec": null,
            "refSpec": null,
            "choices": null  
        },
        "uploaded": {
            "translation": "Date Uploaded",
            "option": "readonly",
            "section": "General",
            "typeSpec": "wiref",
            "refSpec": "time",
            "choices": null
        },
        "modified": {
            "translation": "Date Modified",
            "option": "readonly",
            "section": "General",
            "typeSpec": "wiref",
            "refSpec": "time",
            "choices": null
        },
        "well": {
            "translation": "Well",
            "option": "use",
            // "option" : "notuse",
            "section": "Information",
            "typeSpec": "wilink",
            "refSpec": null,
            "choices": null
        },
        "field": {
            "translation": "Field",
            "option": "readonly",
            // "option" : "notuse",
            "section": "Information",
            "typeSpec": null,
            "refSpec": null,
            "choices": null
        },
        "welltype": {
            "translation": "Well Type",
            "option": "readonly",
            // "option" : "notuse",
            "section": "Information",
            "typeSpec": null,
            "refSpec": null,
            "choices": null
        },
        /*"parameter": {
            "translation": "Parameter",
            "option": "use",
            "section": "Information",
            "typeSpec": null,
            "refSpec": null,
            "choices": null 
        },*/
        "datatype": {
            "translation": "Data Type",
            "option": "use",
            "section": "Information",
            "typeSpec": "wiselect",
            "refSpec": null,
            "choices": "datatypes"
        },
        "relatesto": {
            "translation": "Relates to",
            // "option": "use",
            "option" : "notuse",
            "section": "Information",
            "typeSpec": "wilink",
            "refSpec": null,
            "choices": null
        },
        "associate": {
            "translation": "Associate to",
            "option": "use",
            "section": "Information",
            "typeSpec": "wiassociate",
            "refSpec": null,
            "choices": null
        },
        "quality": {
            "translation": "Quality",
            "option": null,
            "section": "Information",
            "typeSpec": 'rating',
            "refSpec": null,
            "choices": null 
        },
        "description": {
            "translation": "Description",
            "option": "use",
            "section": "Description",
            "typeSpec": null,
            "refSpec": null,
            "choices": null   
        },
        "encodingtype": {
            "translation": "Description",
            "option": "notuse",
            "section": "",
            "typeSpec": null,
            "refSpec": null,
            "choices": null   
        }
    };
}

exports.getSelections = function () {
	return {
  		"datatypes" : [
	  		"",
	  		"Log",
			"Core",
			"Core Image, Thin Sections and SEM",
			"SCAL (Scalar and Array)",
			"Zone & Marker",
			"PVT (Fluid Analysis)",
			"DST (Drill Stem Test)",
			"MDT (Modular Dynamic Formation Test)",
			"RFT (Repeat Formation Test)",
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
			"Others",
            "Cutting Percentage",
            "Composite Log",
            "Oil & Gas Data",
            "Drilling Data",
            "Oil Show",
            "Advanced Rock Properties",
            "Deposition Environment and Seq-Stratigraphy",
            "Petrographic",
            "Geochemical",
            "Geomechanic",
            "Well completion Report"
	  	].sort((a, b) => a.localeCompare(b))
	};
}

exports.validateNodeName = function(name) {
    return validateSpecialCharacter(name);
}
exports.validateKey = function(key) {
    return validateSpecialCharacter(key) && validateUnicodeCharacter(key);
}
function validateSpecialCharacter(str) {
    return !['/', '\\', ':', '*', '?', '\"', '<', '>', '|'].some(c => str.includes(c));
}
function validateUnicodeCharacter(str) {
    return !_.some(str, c => c.charCodeAt(0) >= 128);
}

function getAllWellsInNode(parentNode) {
    const groups = parentNode.children.filter(c => c.type === 'group');
    return _.flatten([...groups.map(g => getAllWellsInNode(g)), parentNode.children.filter(c => c.type === 'well')]);
}
exports.getAllWellsInNode = getAllWellsInNode;
