'use strict';
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');
var path = require('path');
var fs = require('fs');
var uuid = require('uuid');
var spawn = require('child_process').spawn;

var greeting =
    "\n  ____    ____    __" +
    "\n /\\  _`\\ /\\  _`\\ /\\ \\ " +
    "\n \\ \\ \\L\\_\\ \\,\\L\\_\\ \\ \\___      __     _ __   _____ " +
    "\n  \\ \\  _\\/\\/_\\__ \\\\ \\  _ `\\  /'__`\\  /\\`'__\\/\\ '__`\\ " +
    "\n   \\ \\ \\/   /\\ \\L\\ \\ \\ \\ \\ \\/\\ \\L\\.\\_\\ \\ \\/ \\ \\ \\L\\ \\ " +
    "\n    \\ \\_\\   \\ `\\____\\ \\_\\ \\_\\ \\__/.\\_\\\\ \\_\\  \\ \\ ,__/ " +
    "\n     \\/_/    \\/_____/\\/_/\\/_/\\/__/\\/_/ \\/_/   \\ \\ \\/ " +
    "\n                                               \\ \\_\\ " +
    "\n                                                \\/_/ ";

var FSharpGenerator = yeoman.generators.Base.extend({

    username: 'fsprojects',
    repo: 'generator-fsharp',
    branch: 'templates',

    constructor: function() {
        yeoman.generators.Base.apply(this, arguments);
    },

    init: function() {
        var done = this.async();
        this.log(greeting);
        this.log('Welcome to the perfect ' + chalk.red('FSharp') + ' generator!');
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

    askForPaket: function() {
        var done = this.async();
        var prompts = [{
            type: 'list',
            name: 'paket',
            message: 'Do You want to use Paket?',
            choices: [{"name": "Yes", "value": true}, {"name": "No", "value": false}]
        }];
        this.prompt(prompts, function(props) {
            this.paket = props.paket;
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
                var fn = path.join(targetDirPath.replace("ApplicationName", this.applicationName), f.replace("ApplicationName", this.applicationName));
                this.template(fp,fn, this.templatedata);
            }
        }
    },

    writing: function() {
        var log = this.log;
        var p = path.join(this.cacheRoot(), this.username, this.repo, this.branch, this.type);
        this._copy(p, this.applicationName);
        if(this.paket) {
            var bpath = path.join(".paket", "paket.bootstrapper.exe" );
            var p = path.join(this.cacheRoot(), this.username, this.repo, this.branch, bpath);
            this.copy(p, bpath);
        }
    },

    install: function() {
        var log = this.log
        var done = this.async();
        if(this.paket) {
            var bpath = path.join(".paket", "paket.bootstrapper.exe" );
            var bootstrapper = spawn(bpath);
            bootstrapper.stdout.on('data', function (data) {
                log(data.toString());
            });

            bootstrapper.on('close', function (code) {
                var ppath = path.join(".paket", "paket.exe" );
                var paket = spawn(ppath,['convert-from-nuget','-f']);
                paket.stdout.on('data', function (data) {
                    log(data.toString());
                });
                paket.stdout.on('close', function (data) {
                    done();
                });
            });
        }
        else {
            done();
        }
    },


    end: function() {
        this.log('\r\n');
        this.log('Your project is now created');
        this.log('\r\n');
    }
});

module.exports = FSharpGenerator;
