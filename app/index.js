'use strict';
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');
var path = require('path');
var fs = require('fs');
var uuid = require('uuid');

var FSharpGenerator = yeoman.generators.Base.extend({

    username: 'Krzysztof-Cieslak',
    repo: 'generator-fsharp',
    branch: 'templates',

    constructor: function() {
        yeoman.generators.Base.apply(this, arguments);
    },


    init: function() {
        var done = this.async();

        this.log(yosay('Welcome to the F# generator!'));
        this.templatedata = {};
        this.remote(this.username, this.repo, this.branch, function (err,r) {
            done();
        }, true)
    },

    askFor: function() {
        var done = this.async();
        var p = path.join(this.cacheRoot(), this.username, this.repo, this.branch, 'templates.json')
        var choices = JSON.parse(fs.readFileSync(p, "utf8"));
        this.log(choices);
        var prompts = [{
            type: 'list',
            name: 'type',
            message: 'What type of application do you want to create?',
            choices: choices.Templates
        }];

        this.prompt(prompts, function(props) {
            this.type = props.type;
            done();
        }.bind(this));
    },

    askForName: function() {
        var done = this.async();
        var prompts = [{
            name: 'applicationName',
            message: 'What\'s the name of your application?',
            default: this.type
        }];
        this.prompt(prompts, function(props) {
            this.templatedata.namespace = props.applicationName;
            this.templatedata.applicationname = props.applicationName;
            this.templatedata.guid = uuid.v4();
            this.applicationName = props.applicationName;
            done();
        }.bind(this));
    },

    _copy: function(dirPath, targetDirPath){

        var files = fs.readdirSync(dirPath);
        for(var i in files)
        {
            var f = files[i];
            var fp = path.join(dirPath, f);

            if(fs.statSync(fp).isDirectory()) {
                 var newTargetPath = path.join(targetDirPath, f);
                 this._copy(fp, newTargetPath);
            }
            else {
                var fn = path.join(targetDirPath, f.replace("ApplicationName", this.applicationName));
                this.template(fp,fn, this.templatedata);
            }
        }
    },

    writing: function() {
        var p = path.join(this.cacheRoot(), this.username, this.repo, this.branch, this.type);
        this._copy(p, this.applicationName);
    },

    end: function() {
        this.log('\r\n');
        this.log('Your project is now created');
        this.log('\r\n');
    }
});

module.exports = FSharpGenerator;
