import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BaseModule, XOApp } from "@xochat/base";
import { LoginModule } from "@xochat/login";
import { DataSourceModule } from "@xochat/datasource";
import { ContactsModule } from "@xochat/contacts";

// const apiURL = "https://18090.sn12.xyz/v1/";
// const apiURL = "http://13.201.220.225:18090/v1/";
// const apiURL = "http://192.168.10.133:8090/v1/";
// const apiURL = "https://web.xochat.xyz/v1/";
const apiURL = "https://web.chims8.xyz/api/v1/";


if ((window as any).__TAURI_IPC__) {
  // tauri环境
  console.log("tauri环境");
  XOApp.apiClient.config.apiURL = apiURL;
} else if ((window as any)?.__POWERED_ELECTRON__) {
  console.log("__POWERED_ELECTRON__环境");
  XOApp.apiClient.config.apiURL = apiURL;
} else {
  if (process.env.NODE_ENV === "development") {
    XOApp.apiClient.config.apiURL = apiURL;
  } else {
    XOApp.apiClient.config.apiURL = "/api/v1/"; // 正式环境地址 (通用打包镜像，用此相对地址),打包出来的镜像可以通过API_URL环境变量来修改API地址
  }
}

XOApp.apiClient.config.tokenCallback = () => {
  return XOApp.loginInfo.token;
};
XOApp.config.appVersion = `${process.env.REACT_APP_VERSION || "0.0.0"}`;

XOApp.loginInfo.load(); // 加载登录信息

XOApp.shared.registerModule(new BaseModule()); // 基础模块
XOApp.shared.registerModule(new DataSourceModule()); // 数据源模块
XOApp.shared.registerModule(new LoginModule()); // 登录模块
XOApp.shared.registerModule(new ContactsModule()); // 联系模块

XOApp.shared.startup(); // app启动

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
reportWebVitals();
