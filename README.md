# ES6_sample

### express 프로젝트 생성

```
express es6_sample --view=ejs
```

#

## ES6 & Babel 설정

### Babel 설치

```
$ npm install --save-dev @babel/core @babel/cli @babel/preset-env @babel/node

# build 할 때 console.log 제거
$ npm install --save-dev babel-plugin-transform-remove-console
$ npm install --save-dev @babel/plugin-transform-runtime

# runtime 종속성
$ npm install --save @babel/runtime
```

### Babel 설정 파일

```
{
  "presets": ["@babel/env"],
  "ignore": ["./src/public/**/*.js"]
}
```

### package.json 스크립트 수정

```
"scripts": {
	"dev": "nodemon --exec babel-node src/bin/www.js",
    "build": "NODE_ENV=production babel src --out-dir dist --copy-files"
  },
```

#
## 프로젝트 구조 변경
### 기존 (express 최초 생성 시)
```bash
.
├── app.js
├── bin
│   └── www
├── package-lock.json
├── package.json
├── public
│   ├── images
│   ├── javascripts
│   └── stylesheets
│       └── style.css
├── routes
│   ├── index.js
│   └── users.js
└── views
    ├── error.ejs
    └── index.ejs
```
### 변경 (최종)
```bash
.
├── .balbelrc
├── .gitignore
├── .eslintrc.json
├── .prettierrc.json
├── ecosystem.config.js
├── package-lock.json
├── package.json
└── src
    ├── app.js
    ├── bin
    │   └── www.js
    ├── public
    │   ├── images
    │   ├── javascripts
    │   └── stylesheets
    │       └── style.css
    ├── routes
    │   ├── index.js
    │   └── users.js
    └── views
        ├── error.ejs
        └── index.ejs
```

프로젝트 구조 변경
1. root directory에 src 생성
2. bin , public , routes , views , app.js → src 안으로 이동
3. src/bin 내에 www 파일을 www.js 로 변경

### www.js (pm2 설정 포함)
```
#!/user/bin/env node

/**
 * Module dependencies.
 */

import http from 'http';
import app from '../app';

/**
 * Normalize a port into a number, string, or false.
 */

const normalizePort = (val) => {
  const port = parseInt(val, 10);

  if (Number.isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
};

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Event listener for HTTP server "error" event.
 */

const onError = (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
};

/**
 * Event listener for HTTP server "listening" event.
 */

const onListening = () => {
  const addr = server.address();
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
  console.log(`Listening on ${bind}`);
};

/**
 * Listen on provided port, on all network interfaces.
 */

let isDisableKeepAlive = false;
app.use((req, res, next) => {
  if (isDisableKeepAlive) {
    res.set('Connection', 'close');
  }
  next();
});

const listeningServer = server.listen(port, () => {
  if (process.send) {
    process.send('ready');
  }
});

process.on('SIGINT', () => {
  isDisableKeepAlive = true;
  listeningServer.close(() => {
    console.log('server closed');
    process.exit(0);
  });
});

server.on('error', onError);
server.on('listening', onListening);
```
### app.js
```
import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import indexRouter from './routes/index';
import usersRouter from './routes/users';

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
```

### index.js
```
import express from 'express';
const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' });
});

export default router;
```

### users.js
```
// users.js
import express from 'express';
const router = express.Router();

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.send('respond with a resource');
});

export default router;
```

## Prettier & ESLint 설정
### Prettier & ESLint 설치
```
# eslint
$ npm install --save-dev eslint

# @babel/eslint-parser
$ npm install --save-dev @babel/eslint-parser

# prettier
$ npm install --save-dev --save-exact prettier

# 추가로 필요한 Module
$ npm install --save-dev eslint-plugin-prettier eslint-config-prettier

# code style guide Airbnb
$ npm install --save-dev eslint-config-airbnb-base eslint-plugin-import
```
### ESLint 설정 파일 .eslintrc.json

```
{
  "parser": "@babel/eslint-parser",
  "plugins": ["prettier"],
  "extends": ["airbnb-base", "plugin:prettier/recommended"],
  "parserOptions": {
    "ecmaVersion": 6,
    "sourceType": "module"
  },
  "env": {
    "browser": true,
    "node": true
  },
  "ignorePatterns": ["node_modules/"],
  "rules": {
    "prettier/prettier": "error",
    "camelcase": "off"
  }
}
```
### Prettier 설정 파일 .prettierrc.json
```
{
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "always"
}
```
### Husky
```
$ npm install --save-dev husky@4
```
### Lint-staged
```
$ npm install --save-dev lint-staged
```

### package.json 설정 추가
```
"husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "src/**/*.js": [
      "node_modules/.bin/eslint --fix",
      "node_modules/.bin/prettier --write"
    ]
  }
```

## PM2
### pm2 설치
```
$ npm install -g pm2@latest
```
### pm2 설정 파일 ecosystem.config.js
```
module.exports = {
  apps: [{
    name: 'app',
    script: './dist/bin/www.js',
    instances: 0,
    exec_mode: 'cluster',
    wait_ready: true,
    listen_timeout: 50000,
    kill_timeout: 5000
  }]
}
```
### package.json 설정 추가
```
"scripts": {
    "start": "npm run build && pm2 start ecosystem.config.js"
},
```