'use strict';

var async = require('async'),
    GitHubApi = require("github"),
    github = new GitHubApi({
        version: "3.0.0",
        timeout: 5000,
        headers: {
            "user-agent": "check-repo-npm-updates"
        }
    }),
    npm = require('npm'),
    semver = require('semver');

module.exports = check;

function check(token, repo, callback) {
    if (typeof repo === 'function') {
        callback = repo;
        repo = null;
    }

    npm.load({}, function () {
        github.authenticate({
            type: 'oauth',
            token: token
        });

        var repos = {},
            packages = {};

        github.repos.getAll({
            type: 'owner'
        }, function (err, _repos) {
            if (err) return callback(err);

            if (repo) {
                _repos = _repos.filter(function (r) { return r.name === repo; });
            }

            // for each repo, get all branches and check each branch for a package.json
            async.each(_repos, function (repo, next) {
                github.repos.getBranches({
                    user: repo.owner.login,
                    repo: repo.name
                }, function (err, branches) {
                    if (err) return next();

                    var branchInfo = {};

                    async.each(branches, function (branch, next) {
                        // get the package.json
                        github.repos.getContent({
                            user: repo.owner.login,
                            repo: repo.name,
                            path: 'package.json',
                            ref: branch.name
                        }, function (err, packageJson) {
                            if (err || packageJson.encoding !== 'base64') {
                                // no package.json or unsupported encoding, skip this repo
                                return next();
                            }

                            try {
                                var json = JSON.parse(new Buffer(packageJson.content, 'base64').toString());
                            } catch (e) {
                                // bad encoding or bad json, so skip this repo
                                return next();
                            }

                            var deps = json.dependencies !== null && typeof json.dependencies === 'object' && json.dependencies || {},
                                devDeps = json.devDependencies !== null && typeof json.devDependencies === 'object' && json.devDependencies || {};

                            branchInfo[branch.name] = {
                                packageName: json.name,
                                packageVersion: json.version,
                                dependencies: deps,
                                devDependencies: devDeps
                            };

                            // if the dependency version starts with a number, then assume it's a semver and not a git repo
                            Object.keys(deps).forEach(function (name) { /^\d/.test(deps[name]) && (packages[name] = 1); });
                            Object.keys(devDeps).forEach(function (name) { /^\d/.test(deps[name]) && (packages[name] = 1); });

                            next();
                        });
                    }, function () {
                        // now that we've scanned all branches for a package.json, if we found any, then
                        // we say this repo is legit
                        if (Object.keys(branchInfo).length) {
                            repos[repo.name] = {
                                url: repo.html_url,
                                description: repo.description,
                                fork: repo.fork,
                                private: repo.private,
                                default_branch: repo.default_branch,
                                branches: branchInfo
                            };
                        }
                        next();
                    });
                });
            }, function (err) {
                if (err) return callback(err);

                // fetch all
                async.each(Object.keys(packages), function (pkg, next) {
                    npm.commands.view([pkg, 'version'], true, function (err, data) {
                        err || (packages[pkg] = Object.keys(data)[0]);
                        next();
                    });
                }, function (err) {
                    if (err) return callback(err);

                    Object.keys(repos).forEach(function (name) {
                        var repo = repos[name];
                        Object.keys(repo.branches).forEach(function (name) {
                            var branch = repo.branches[name];
                            Object.keys(branch.dependencies).forEach(function (pkg) {
                                try {
                                    var ver = branch.dependencies[pkg];
                                    if (packages[pkg] && semver.lt(ver, packages[pkg])) {
                                        branch.dependencies[pkg] = [ ver, packages[pkg] ];
                                    }
                                } catch (e) {}
                            });
                            Object.keys(branch.devDependencies).forEach(function (pkg) {
                                try {
                                    var ver = branch.devDependencies[pkg];
                                    if (packages[pkg] && semver.lt(ver, packages[pkg])) {
                                        branch.devDependencies[pkg] = [ ver, packages[pkg] ];
                                    }
                                } catch (e) {}
                            });
                        });
                    });

                    callback(null, repos, packages);
                });
            });
        }); // end get repos
    }); // end npm.load()
}
