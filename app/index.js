'use strict';
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');
var path = require('path');
var fs = require('fs');
var uuid = require('uuid');
var spawn = require('child_process').spawn;
var spawnSync = require('child_process').spawnSync;
var request = require('request');

var _0777 = parseInt('0777', 8);
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


fs.mkdirParent = function(dirPath, mode, callback) {
  //Call the standard fs.mkdir
  fs.mkdir(dirPath, mode, function(error) {
    //When it fail in this way, do the custom steps
    if (error && error.errno === 34) {
      //Create all the parents recursively
      fs.mkdirParent(path.dirname(dirPath), mode, callback);
      //And then the directory
      fs.mkdirParent(dirPath, mode, callback);
    }
    //Manually run the callback since we used our own callback to do all these
    callback && callback(error);
  });
};

fs.mkdirParentSync = function sync (p, opts, made) {
    if (!opts || typeof opts !== 'object') {
        opts = { mode: opts };
    }

    var mode = opts.mode;
    var xfs = opts.fs || fs;

    if (mode === undefined) {
        mode = _0777 & (~process.umask());
    }
    if (!made) made = null;

    p = path.resolve(p);

    try {
        xfs.mkdirSync(p, mode);
        made = made || p;
    }
    catch (err0) {
        switch (err0.code) {
            case 'ENOENT' :
                made = sync(path.dirname(p), opts, made);
                sync(p, opts, made);
                break;

            // In the case of any other error, just see if there's a dir
            // there already.  If so, then hooray!  If not, then something
            // is borked.
            default:
                var stat;
                try {
                    stat = xfs.statSync(p);
                }
                catch (err1) {
                    throw err0;
                }
                if (!stat.isDirectory()) throw err0;
                break;
        }
    }

    return made;
};


var FSharpGenerator = yeoman.generators.Base.extend({

    username: 'fsprojects',
    repo: 'generator-fsharp',
    branch: 'templates',

    ACTION_CREATE_STANDALONE_PROJECT: 1,
    ACTION_ADD_PROJECT_TO_SOLUTION: 2,
    ACTION_CREATE_EMPTY_SOLUTION: 3,



    constructor: function() {
        yeoman.generators.Base.apply(this, arguments);
    },

    _isOnWindows : function() {
        return /^win/.test(process.platform);
    },

    _download : function(t, done, reload) {
        t.remote(t.username, t.repo, t.branch, function (err,r) {
            done();
        }, reload)
    },

    _getTemplateDirectory : function() {
        //return path.join(this.sourceRoot(), "..","..","templates");

        return path.join(this.cacheRoot(), this.username, this.repo, this.branch);
    },

    _execManaged : function(file, args, options) {
        if(this._isOnWindows()){
            return spawn(file, args, options);
        }
        else {
            var monoArgs = [file];
            monoArgs = monoArgs.concat(args);
            return spawn('mono', monoArgs, options);
        }
    },

    _saveSHA : function (p, sha, old) {
        if (!fs.existsSync(p)){
            fs.mkdirParentSync(path.dirname(p));
        }

        if(old){
            fs.unlinkSync(p);
        }
        fs.appendFileSync(p, sha);
    },

    _checkSHA : function (t, p, sha, old, done) {
        var oldsha = "";
        if(old) oldsha = fs.readFileSync(p, 'utf8');
        if(old && sha != oldsha) {
            t._saveSHA(p, sha, true);
            t._download(t, done, true)
        }
        else if (old && sha == oldsha) {
            done();
        }
        else {
            t._saveSHA(p, sha, false);
            t._download(t, done, true);
        }
    },

    _getSHA : function(old, p, done) {
        var log = this.log;
        var t = this;
        var checkSHA = this._checkSHA;
        var options = {
            url: "https://api.github.com/repos/fsprojects/generator-fsharp/commits?sha=templates",
            headers: {
                'User-Agent': 'request'
            }
        };
        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var sha = JSON.parse(body)[0].sha;
                checkSHA(t, p, sha, old, done);
            }
        });
    },




    init: function() {
        this.log(greeting);
        this.log('Welcome to the perfect ' + chalk.red('FSharp') + ' generator!');
        this.templatedata = {};
        var done = this.async();
        var p = path.join(this.cacheRoot(), "sha")
        var old = fs.existsSync(p);
        this._getSHA(old, p, done);
    },

    askFor: function() {
        var done = this.async();
        var prompts = [{
            type: 'list',
            name: 'action',
            message: 'What do You want to do?',
            choices: [{"name": "Create standalone project", "value": this.ACTION_CREATE_STANDALONE_PROJECT},
                      {"name": "Add new project to solution", "value": this.ACTION_ADD_PROJECT_TO_SOLUTION},
                      {"name": "Create empty solution", "value": this.ACTION_CREATE_EMPTY_SOLUTION}
                      ]
        }];
        this.prompt(prompts, function(props) {
            this.action = props.action;
            done();
        }.bind(this));
    },

    askForProject: function() {
        var done = this.async();
        if(this.action !== this.ACTION_CREATE_EMPTY_SOLUTION) {
            var p = path.join(this._getTemplateDirectory(), 'templates.json')
            var choices = JSON.parse(fs.readFileSync(p, "utf8"));
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
        }
        else {
            done();
        }
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
            if(this.action === this.ACTION_ADD_PROJECT_TO_SOLUTION) {
                this.templatedata.packagesPath = "../packages"
                this.templatedata.paketPath = "../.paket"
            }
            else {
                this.templatedata.packagesPath = "packages"
                this.templatedata.paketPath = ".paket"
            }
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

    askForFake: function() {
        var done = this.async();
        var prompts = [{
            type: 'list',
            name: 'fake',
            message: 'Do You want to use FAKE?',
            choices: [{"name": "Yes", "value": true}, {"name": "No", "value": false}]
        }];

        if (this.paket) {
            this.prompt(prompts, function(props) {
                this.fake = props.fake;
                done();
            }.bind(this));
            return;
        }

        done();
    },

    _copy: function(dirPath, targetDirPath){

        var files = fs.readdirSync(dirPath);
        for(var i in files)
        {
            var f = files[i];
            var fp = path.join(dirPath, f);
            this.log(f);
            if(fs.statSync(fp).isDirectory()) {
                 var newTargetPath = path.join(targetDirPath, f);
                 this._copy(fp, newTargetPath);
            }
            else {
                var fn = path.join(targetDirPath.replace('ApplicationName', this.applicationName), f.replace('ApplicationName', this.applicationName));
                this.template(fp,fn, this.templatedata);
            }
        }
    },

    writing: function() {
        var log = this.log;
        var p;
        if (this.action === this.ACTION_CREATE_EMPTY_SOLUTION){
            p = path.join(this._getTemplateDirectory(), 'sln')
        }
        else {
            p = path.join(this._getTemplateDirectory(), this.type);
        }
        this._copy(p, this.applicationName);
        if(this.paket) {
            var bpath;
            if(this.action !== this.ACTION_ADD_PROJECT_TO_SOLUTION) {
                bpath = path.join(this.applicationName, ".paket", "paket.bootstrapper.exe" );
            }
            else {
                bpath = path.join(".paket", "paket.bootstrapper.exe" );
            }
            var p = path.join(this._getTemplateDirectory(), ".paket", "paket.bootstrapper.exe");
            this.copy(p, bpath);
        }
        if(this.fake) {
            if (this.action !== this.ACTION_ADD_PROJECT_TO_SOLUTION){
                var fakeSource = path.join(this._getTemplateDirectory(), ".fake");
                this._copy(fakeSource, this.applicationName);
            }
        }
    },

    install: function() {
        var log = this.log
        var done = this.async();
        var appName = this.applicationName;
        var action = this.action;
        var dest = this.destinationRoot();
        var isfake = this.fake;
        var fs = this.fs;

        var generator = this;

        var isWin = this._isOnWindows();

        if(this.fake) {
            if (!this._isOnWindows()) {
                var buildShPath = path.join(dest, appName, 'build.sh');
                var chmodProc = spawnSync('chmod', ['+x', buildShPath], {cwd: dest});
            }
        }

        if(this.paket) {
            var bpath;
            if(this.action !== this.ACTION_ADD_PROJECT_TO_SOLUTION) {
                bpath = path.join(this.applicationName, ".paket", "paket.bootstrapper.exe" );
            }
            else {
                bpath = path.join(".paket", "paket.bootstrapper.exe" );
            }
            var bootstrapper = this._execManaged(bpath, [], {});

            bootstrapper.stdout.on('data', function (data) {
                log(data.toString());
            });

            bootstrapper.on('close', function (code) {
                var ppath;
                var cpath;
                if(action !== this.ACTION_ADD_PROJECT_TO_SOLUTION) {
                    ppath = path.join(dest, appName, ".paket", "paket.exe" );
                    cpath = path.join(dest, appName);
                }
                else {
                    ppath = path.join(dest, ".paket", "paket.exe" );
                    cpath = dest;
                }
                try{

                log(cpath);
                var paket = generator._execManaged(ppath, ['convert-from-nuget','-f'], {cwd: cpath});

                paket.stdout.on('data', function (data) {
                    log(data.toString());
                });

                paket.stdout.on('close', function (data) {
                    var simplifiy = generator._execManaged(ppath, ['simplify'], {cwd: cpath});

                    simplifiy.stdout.on('data', function (data) {
                        log(data.toString());
                    });
                    simplifiy.stdout.on('close', function (data) {
                        if (isfake) {
                            var addFake = generator._execManaged(ppath, ['add', 'nuget', 'FAKE'], {cwd: cpath});

                            addFake.stdout.on('close', function(data) {
                                done();
                            })
                        }
                        else {
                            done();
                        }
                    });
                });
                }
                catch(ex)
                {
                    log(ex);
                }
            });
        }
        else
        {
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
