![](docs/pc11.png)

![](docs/pc22.png)

## 运行

1. yarn install

2. yarn dev

## 发布镜像

修改 api 地址 apps/web/src/index.tsx 修改 XOApp.apiClient.config.apiURL = "/api/v1/"

make deploy

## PC 端运行

tauri 环境安装 (https://tauri.app/v1/guides/getting-started/prerequisites)

#### 调试

yarn tauri dev

#### 打包

yarn tauri build  
（window 打包的时候 要去掉 package.json 里的 build 里的 REACT_APP_VERSION=$npm_package_version 要不然执行 yarn tauri build 会报错）
(如果需要打包 M1 架构的包 需要安装 aarch64-apple-darwin（执行：rustup target add aarch64-apple-darwin））

yarn tauri build --target aarch64-apple-darwin （M1 架构的包）

yarn tauri build --target universal-apple-darwin (通用架构，生成可在 Apple 芯片和基于 Intel 的 Mac 上运行的通用 macOS 二进制文件。)

## 其他技巧

icon 生成

```
tauri icon [ICON-PATH]
```

准备一张 1024x1024 的 icon 执行上面命令 即可生成各种尺寸的 icon

```
icon.icns = macOS
icon.ico = MS Windows
*.png = Linux
```

**注意**

添加依赖

yarn workspace @xochat/web add react-avatar-editor

## 使用 Github Action 自动构建各端 PC 版本

需要先全局安装 @tauri-apps/cli
yarn global add @tauri-apps/cli

tauri signer generate -w ~/.tauri/xochat.key

上面 的命令会自动生成一个公钥、私钥对。公钥可以公开分享，私钥必须严密保存。

在 Github Secrets 中 配置 TAURI_PRIVATE_KEY 和 TAURI_KEY_PASSWORD

(参考：https://www.banyudu.com/posts/tauri-version-release-and-update-guide)

## 自动更新

1. 修改 tauri.conf.json 里的 updater.pubkey 的内容（上面通过 tauri signer generate 生成的公钥）

2. 修改 tauri.conf.json 里的 updater.endpoints 的内容为自己服务器的更新地址
