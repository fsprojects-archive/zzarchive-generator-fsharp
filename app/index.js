'use strict';
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');
var path = require('path');
var fs = require('fs');
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
        var app = '';
        switch (this.type) {
            case 'empty':
                app = 'EmptyApplication';
                break;
            case 'console':
                app = 'ConsoleApplication';
                break;
            case 'classlib':
                app = 'ClassLibrary';
                break;
            case 'unittest':
                app = 'UnitTest';
                break;
        }
        var prompts = [{
            name: 'applicationName',
            message: 'What\'s the name of your ASP.NET application?',
            default: app
        }];
        this.prompt(prompts, function(props) {
            this.templatedata.namespace = props.applicationName;
            this.templatedata.applicationname = props.applicationName;
            this.applicationName = props.applicationName;
            done();
        }.bind(this));
    },

    writing: function() {
        var p = path.join(this.cacheRoot(), this.username, this.repo, this.branch, this.type)
        this.sourceRoot(p);
        var log = this.log
        var appName = this.applicationName;
        var t = function self(dirPath, targetDirPath){
            var files = fs.readdirSync(p);
            files.forEach(function(f){
                var fp = path.join(dirPath, f);

                if(fs.statSync(fp).isDirectory()) {
                     var newTargetPath = path.join(targetDirPath, f);
                     self(fp, newTargetPath);
                }
                else {
                    var fn = f.replace("ApplicationName", appName);

                    log("FILE: " + fn);
                }

            })
        };
        t(p);


        // switch (this.type) {
        //     case 'console':
        //         this.copy(this.sourceRoot() + '/App.config', this.applicationName + '/App.config');
        //         this.template(this.sourceRoot() + '/Program.fs', this.applicationName + '/Program.fs', this.templatedata);
        //         this.template(this.sourceRoot() + '/ConsoleApplication1.fsproj', this.applicationName + '/' + this.applicationName + '.fsproj', this.templatedata);
        //         break;
        //
        //     case 'classlib':
        //         this.template(this.sourceRoot() + '/Script.fsx', this.applicationName + '/Script.fsx', this.templatedata);
        //         this.template(this.sourceRoot() + '/Library1.fs', this.applicationName + '/' + this.applicationName + '.fs', this.templatedata);
        //         this.template(this.sourceRoot() + '/Library1.fsproj', this.applicationName + '/' + this.applicationName + '.fsproj', this.templatedata);
        //         break;
        //     default:
        //         this.log('Unknown project type');
        // }
    },

    end: function() {
        this.log('\r\n');
        this.log('Your project is now created, you can use the following commands to get going');
        this.log(chalk.green('    paket install'));
        this.log('\r\n');
    }
});

module.exports = FSharpGenerator;
