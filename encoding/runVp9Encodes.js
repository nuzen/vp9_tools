"user strict";
vp9Parser = require("./vp9Parser.js");

var parObj = new vp9Parser("./pa.json"); // Initialize
var cmdArray = parObj.cmds;
var OPNames  = parObj.names;

// Runs child processes, sequentially
var cmd;
var exec = require('child_process').execSync;
//console.log(OPNames);
for(var i = 0; i < cmdArray.length; i++)
{
    cmd = cmdArray[i];
    var opTxt = OPNames[i] + '.txt';
    var opVid = OPNames[i] + '.webm';
    cmd = cmd + ' -o ' + opVid + ' > "' + opTxt + '" 2>&1' // 2>&1 is required to print output to file
    console.log(cmd);
    exec(cmd, function(error, stdout, stderr)
	 {
             console.log(stdout)
	 });

}
