# Check Repo NPM Updates

Command line tool for checking all your GitHub repos for NPM updates.

## Usage

```
check-repo-npm-updates <github oauth token> [<repo>]
```

## Programmatic Usage

You can also directly `require()` this module and do whatever you want
with the data:

```javascript
require('check-repo-npm-updates')
    .check('github oath token', function (err, repos, packages) {
        if (!err) {
            // do something with repos
        }
    });
```

Or if you only want to check a specific repo:

```javascript
require('check-repo-npm-updates')
    .check('github oath token', 'myproject', function (err, repos, packages) {
        if (!err) {
            // do something with repos
        }
    });
```

The `repos` value looks like this:

```json
{
    "myproject": {
        "url": "https://github.com/myuser/myproject",
        "description": "My Project",
        "fork": false,
        "private": false,
        "default_branch": "master",
        "branches": {
            "master": {
                "packageName": "myproject",
                "packageVersion": "1.0.0",
                "dependencies": {
                    "async": "0.9.0",
                    "colors": "1.0.3",
                    "moment": [ "2.8.3", "2.10.0" ],
                    "node-uuid": [ "1.4.1", "1.4.3" ],
                    "wrench": "1.5.8"
                },
                "devDependencies": {}
            }
        }
    }
}
```

The `packages` value looks like this:

```json
{
    "async": "0.9.0",
    "colors": "1.0.3",
    "moment": "2.10.0",
    "node-uuid": "1.4.3",
    "wrench": "1.5.8"
}
```

## License

(The MIT License)

Copyright (c) 2015 Chris Barber

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
