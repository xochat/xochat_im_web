module.exports = {
  productName: "tangsengdaodao", //项目名
  appId: "com.tsdaodao.im",
  copyright: "Copyright © tsdaodao", //版权
  directories: {
    output: "dist-ele", // 输出文件夹
  },
  npmRebuild: false,
  asar: false,
  buildDependenciesFromSource: true,
  electronDownload: {
    mirror: "https://registry.npmmirror.com/-/binary/electron/",
  },
  files: ["resources/**/*","out-election/**/*", "build/**/*"], // 需要打包的文件
  extraMetadata: {
    main: "out-election/main/index.js",
  },
  mac: {
    category: "public.app-category.instant-messaging",
    target: [
      {
        target: 'dmg',
        arch: ['x64', 'arm64']
      }
    ],
    artifactName: '${productName}-${os}-${version}-${arch}.${ext}',
    icon: "resources/icons/icon.icns"
  },
  dmg: {
    // background: 'build/appdmg.png', // dmg安装窗口背景图
    icon: "resources/icons/icon.icns", // 客户端图标
    iconSize: 100, // 安装图标大小
    // 安装窗口中包含的项目和配置
    contents: [
      { x: 380, y: 280, type: "link", path: "/Applications" },
      { x: 110, y: 280, type: "file" },
    ],
    window: { width: 500, height: 500 }, // 安装窗口大小
  },
  win: {
    icon: "resources/icons/icon.ico",
    verifyUpdateCodeSignature: false,
    target: ["nsis", "zip"],
    artifactName: "${productName}-Setup-${version}.${ext}"
  },
  nsis: {
    oneClick: false, // 是否一键安装
    allowElevation: true, // 允许请求提升。 如果为false，则用户必须使用提升的权限重新启动安装程序。
    allowToChangeInstallationDirectory: true, // 允许修改安装目录
    // installerIcon: "./build/icon.ico",// 安装图标
    // uninstallerIcon: "./build/icons/bbb.ico",//卸载图标
    // installerHeaderIcon: "./build/icon.ico", // 安装时头部图标
    createDesktopShortcut: true, // 创建桌面图标
    createStartMenuShortcut: true, // 创建开始菜单图标
  },
  linux: {
    target: ["AppImage", "deb"],
    icon: "resources/icons/icon.icns",
  },
};