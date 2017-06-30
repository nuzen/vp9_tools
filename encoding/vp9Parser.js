"use strict";

/**
   This class provides methods and properties that aid in running  multiple vp9 encodings.
   Once encoded the encodings and their frame level statistics are stored
   with intuitive naming convention derived from parameters that are varied between encodings.
   The Json file should follow the structure demonstrated in file ``Vp9_Template.json``.
   @class vp9Parser
   @constructor
   @param{string} fileFullPath full path to json file having encoding parameters.
   @property allParams
*/
module.exports = class vp9Parser{
    constructor(fileFullPath){

	// Loading all the javascript file.
	this.allParams = require(fileFullPath);

	// Extracting name of the file to initialize name array.
	var filename = this.allParams["fullPath"].replace(/^.*[\\\/]/, '');
	var name = filename.split(".")[0];
	this.nameArray = [name];
	
	// Initializing command array with executable full path
	this.cmdArray = [this.allParams["exePath"]];
    }
    
    /**
     * Returns an array having commands in all possible combinations.
     * @property cmds
     * @type {String array}
     */
    get cmds(){
	this.makeCmdArray();
	return this.cmdArray;
    }
    /**
     * Returns an array having intuitive names created by using parameters that
     * vary across encodings.
     * @property names
     * @type {String array}
     */
    get names(){
	return this.nameArray
    }

    /**
     * 
     *@method makeCmdArray();
     */
    makeCmdArray(){
	// Split into relevant json objects
	this.splitParams();
	// Creates strings with common parameters.
	this.makeString("nonVarNoArg");
	this.makeString("nonVarArg");
	// Creates strings with variable parametrs <<- Fun starts here
	this.makeString("varNoArg");
	this.makeString("varArg");
	this.makeString("varNoArgGrp");
	this.makeString("varArgGrp");
	this.makeString("varMixGrp");
	this.makeString("addSource");
    }
    /**
     * @method makeString
     */
    makeString(paramType){
	// str    : used by variable parameters
	// strArr : used by variable parameters
	var parJson, str = "", key;
	switch (paramType){
	case "nonVarNoArg":
	    // Creates string for non variable parameters
	    // with no aruguments.
	    // No change in name array
	    for(key in this.nonVarNoArg){
		str = str+" --"+key;
	    }
	    this.cmdArray = [this.cmdArray + str];
	    break;
	case "nonVarArg":
	    // Creates string for non variable parameters
	    // with an argument.
	    // No change in name array.
	    for(key in this.nonVarArg){
		str = str+" --"+key+"="+this.nonVarArg[key];
	    }
	    this.cmdArray = [this.cmdArray + str];
	    break;
	case "varNoArg":
	    // Creates string for variable parameters
	    // without argument.
	    // Name array will be updated.
	    if(Object.keys(this.varNoArg).length == 0)
		break;
	    for (key in this.varNoArg){
		var arr = this.varNoArg[key];
		this.expandVarNoArg(arr);
	    }
	    break;
	case "varArg":
	    // Creates string for variable parameters
	    // with arguments.
	    // Name array will be updated.
	    if(Object.keys(this.varArg).length == 0)
		break;
	    for (key in this.varArg){
		var arr = this.varArg[key];
		this.expandVarArg(key, arr);
	    }
	    break;
	case "varNoArgGrp":
	    // Creates string for grouped variable parameters
	    // with no arguments.
	    // Name array will be updated.
	    if(Object.keys(this.varNoArgGrp).length == 0)
		break;
	    this.expandVarNoArgGrp();
	    break;
	case "varArgGrp":
	    // Creates string for grouped variable parameters
	    // with no arguments.
	    // Name array will be updated.
	    if(Object.keys(this.varArgGrp).length == 0)
		break;
	    this.expandVarArgGrp();
	    break;
	case "addSource":
	    this.addSource();
	    break;
	case "varMixGrp":
	    if(Object.keys(this.varMixGrp).length == 0)
		break;
	    this.expandVarMixGrp();
	    break;
	default:
	    console.log("parameter type not found");
	}
    }

    /**
     * Adds source file path to command array
     * @method addSource
     */
    addSource(){
	var newArr = [];
	var origArr = this.cmdArray;
	for (var i = 0; i < origArr.length; i++){
	    newArr = newArr.concat(origArr[i]+" "+this.allParams["fullPath"]);
	}
	this.cmdArray = newArr;
    }
    /**
     * Expands encoding configurations with mixed parameters that are grouped together.
     * For example, it makes sense to have {`rt`,`pass=1`},{`good`,`pass=2`} together.
     * @method expandVarMixGrp
     */
    expandVarMixGrp(){
		var fkey, grpLen, cmdGrpArr=[],namGrpArr=[];
	fkey = Object.keys(this.varMixGrp)[0];
	grpLen = this.varMixGrp[fkey].length;
	// Creating an array having strings that
	// needs to be added to command array.
	for ( var i = 0; i < grpLen; i++){
	    var tmpCmdStr = "";
	    var tmpNamStr = "";
	    for( var key in this.varMixGrp){
		if(key==""){
		    tmpCmdStr = tmpCmdStr + " --" + this.varMixGrp[key][i];
		    tmpNamStr = tmpNamStr + "_" + this.varMixGrp[key][i];
		}
		else{
		    tmpCmdStr = tmpCmdStr + " --" + key + "=" + this.varMixGrp[key][i];
		    tmpNamStr = tmpNamStr + "_" + key + "=" + this.varMixGrp[key][i];
		}

	    }
	    cmdGrpArr = cmdGrpArr.concat(tmpCmdStr);
	    namGrpArr = namGrpArr.concat(tmpNamStr);
	}

	var newArr = [], newNArr=[];
	var origArr = this.cmdArray;
	var origNArr = this.nameArray;
	for (var i = 0; i < origArr.length; i++){
	    for (var j = 0; j < cmdGrpArr.length; j++){
		newArr = newArr.concat(origArr[i]+ cmdGrpArr[j]);
		newNArr = newNArr.concat(origNArr[i]+ namGrpArr[j]);
	    }
	}
	this.cmdArray = newArr;
	this.nameArray = newNArr;
	
    }
    /**
     * Expands encoding configurations with parameters that **donot include** arguments.
     * @method expandVarNoArg
     * @param {Array} - An array of parameters that needs to be added.
     * @return {Array} - Expanded array with new parameters added.
     */
    expandVarNoArg(arr){
	var newArr = [], newNArr=[];
	var origArr = this.cmdArray;
	var origNArr = this.nameArray;
	for (var i = 0; i < origArr.length; i++){
	    for (var j = 0; j < arr.length; j++){
		newArr = newArr.concat(origArr[i]+" --"+arr[j]);
		newNArr = newNArr.concat(origNArr[i]+"_"+arr[j]);
	    }
	}
	this.cmdArray = newArr;
	this.nameArray = newNArr;
    }
    /**
     * Expands encoding configurations with parameters that **include** arguments.
     * @method expandVarArg
     * @param {String} key  Parameter name, acceessed via key.
     * @param {Array}  array An array of strings with values for current parameter.
     * @return {Array} - Expanded array with new parameters added.
     */
    expandVarArg(key, arr){
	var newArr = [], newNArr=[];
	var origArr = this.cmdArray;
	var origNArr = this.nameArray;
	for (var i = 0; i < origArr.length; i++){
	    for (var j = 0; j < arr.length; j++){
		newArr = newArr.concat(origArr[i]+" --"+key+"="+arr[j]);
		newNArr = newNArr.concat(origNArr[i]+"_"+key+"="+arr[j]);
	    }
	}
	this.cmdArray = newArr;
	this.nameArray = newNArr;
    }
    
    /**
     * @method expandVarNoArgGrp
     */
    expandVarNoArgGrp(){
	var fkey, grpLen, cmdGrpArr=[],namGrpArr=[];
	fkey = Object.keys(this.varNoArgGrp)[0];
	grpLen = this.varNoArgGrp[fkey].length;
	// Creating an array having strings that
	// needs to be added to command array.
	for ( var i = 0; i < grpLen; i++){
	    var tmpCmdStr = "";
	    var tmpNamStr = "";
	    for( var key in this.varNoArgGrp){
		tmpCmdStr = tmpCmdStr + " --" + this.varNoArgGrp[key][i];
		tmpNamStr = tmpNamStr + "_" + this.varNoArgGrp[key][i];
	    }
	    cmdGrpArr = cmdGrpArr.concat(tmpCmdStr);
	    namGrpArr = namGrpArr.concat(tmpNamStr);
	}

	var newArr = [], newNArr=[];
	var origArr = this.cmdArray;
	var origNArr = this.nameArray;
	for (var i = 0; i < origArr.length; i++){
	    for (var j = 0; j < cmdGrpArr.length; j++){
		newArr = newArr.concat(origArr[i]+ cmdGrpArr[j]);
		newNArr = newNArr.concat(origNArr[i]+ namGrpArr[j]);
	    }
	}
	this.cmdArray = newArr;
	this.nameArray = newNArr;
    }
    /**
     * @method expandVarArgGrp
     */
    expandVarArgGrp(){
	var fkey, grpLen, cmdGrpArr=[],namGrpArr=[];
	fkey = Object.keys(this.varArgGrp)[0];
	grpLen = this.varArgGrp[fkey].length;
	// Creating an array having strings that
	// needs to be added to command array.
	for ( var i = 0; i < grpLen; i++){
	    var tmpCmdStr = "";
	    var tmpNamStr = "";
	    for( var key in this.varArgGrp){
		tmpCmdStr = tmpCmdStr + " --" + key + "=" + this.varArgGrp[key][i];
		tmpNamStr = tmpNamStr + "_" + key + "=" + this.varArgGrp[key][i];
	    }
	    cmdGrpArr = cmdGrpArr.concat(tmpCmdStr);
	    namGrpArr = namGrpArr.concat(tmpNamStr);
	}

	var newArr = [], newNArr=[];
	var origArr = this.cmdArray;
	var origNArr = this.nameArray;
	for (var i = 0; i < origArr.length; i++){
	    for (var j = 0; j < cmdGrpArr.length; j++){
		newArr = newArr.concat(origArr[i]+ cmdGrpArr[j]);
		newNArr = newNArr.concat(origNArr[i]+ namGrpArr[j]);
	    }
	}
	this.cmdArray = newArr;
	this.nameArray = newNArr;
    }
    
    /**
       Splits input parameters into four groups (JSON objects). These groups are dealt
       seperately to create encoding command and output name. 
       @method splitParams
       @return {Object}
       - ``nonVarNoArg``: 
       Parameters that are same across encodings and have no arguments to pass.
       - ``nonVarArg``: 
       Parameters that are same across encodings which require an argument.
       - ``varNoArg``: 
       parameters that needs to be changed across encodings which don't possess aruguments.
       - ``varArg``: 
       Parameters that needs to be changed across encodings which possess arguments.

    */
    splitParams(){
	var nonVar = JSON.parse(JSON.stringify(this.allParams["NonVar"]));
	var vari = JSON.parse(JSON.stringify(this.allParams["Var"]));
	this.nonVarNoArg = JSON.parse(JSON.stringify(nonVar["NoArg"]));
	this.nonVarArg = JSON.parse(JSON.stringify(nonVar["Arg"]));
	this.varNoArg = JSON.parse(JSON.stringify(vari["NoArg"]));
	this.varArg = JSON.parse(JSON.stringify(vari["Arg"]));
	this.varNoArgGrp = JSON.parse(JSON.stringify(vari["NoArgGrp"]));
	this.varArgGrp = JSON.parse(JSON.stringify(vari["ArgGrp"]));
	this.varMixGrp = JSON.parse(JSON.stringify(vari["MixGrp"]));
    }
}
