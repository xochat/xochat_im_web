import axios from "axios";
import React, { Component } from "react";
import { Button, Spin, Toast } from "@douyinfe/semi-ui";
import "./login.scss";
import QRCode from "qrcode.react";
import { XOApp, Provider } from "@xochat/base";
import { LoginStatus, LoginType, LoginVM } from "./login_vm";
import classNames from "classnames";

type LoginState = {
  loginStatus: string;
  loginUUID: string;
  getLoginUUIDLoading: boolean;
  scanner?: string; // 扫描者的uid
  qrcode?: string;
  passType?: string; //是否展示密码框
};

class Login extends Component<any, LoginState> {
  render() {
    return (
      <Provider
        create={() => {
          return new LoginVM();
        }}
        render={(vm: LoginVM) => {
          return (
            <div className="xo-login">
              {/* <span style={{ color: "#000" }}>{vm.loginType}666</span> */}

              <div
                className="xo-login-link"
                onClick={() => {
                  console.log("?????");
                  vm.loginType = vm.loginType == 0 ? 1 : 0;
                }}
              >
                {vm.loginType == 1 ? (
                  <img src={require("./assets/qrcode.png")} alt="qrcode" />
                ) : (
                  <img src={require("./assets/pc.png")} alt="pc" />
                )}
              </div>
              <div className="xo-login-content">
                <div
                  className="xo-login-content-phonelogin"
                  style={{
                    display:
                      vm.loginType === LoginType.phone ? "block" : "none",
                  }}
                >
                  <div className="xo-login-content-logo">
                    <img src={"/logo.png"} alt="logo" />
                  </div>
                  <div className="xo-login-content-slogan">
                    更愉快的与朋友交流
                  </div>
                  <div className="xo-login-content-form">
                    <input
                      type="text"
                      placeholder="手机号"
                      onChange={(v) => {
                        vm.username = v.target.value;
                      }}
                    ></input>
                    <div className="pass">
                      {/* <span style={{ color: "#000" }}>{vm.username}000</span> */}
                      <input
                        type={vm.passType}
                        placeholder="密码"
                        onChange={(v) => {
                          vm.password = v.target.value;
                        }}
                      ></input>
                      <div
                        className="xo-login-content-form-icon"
                        onClick={() => {
                          vm.passType =
                            vm.passType == "text" ? "password" : "text";
                          console.log("?????", vm.passType);
                        }}
                      >
                        <img
                          src={require(`./assets/${vm.passType}.png`)}
                          alt=""
                        />
                      </div>
                    </div>
                    <div className="xo-login-content-form-buttons">
                      <Button
                        loading={vm.loginLoading}
                        className="xo-login-content-form-ok"
                        type="primary"
                        theme="solid"
                        onClick={async () => {
                          if (!vm.username) {
                            Toast.error("手机号不能为空！");
                            return;
                          }
                          if (!vm.password) {
                            Toast.error("密码不能为空！");
                            return;
                          }
                          let fullPhone = vm.username;
                          if (
                            vm.username.length == 11 &&
                            vm.username.substring(0, 1) === "1"
                          ) {
                            fullPhone = `0086${vm.username}`;
                          } else {
                            if (vm.username.startsWith("+")) {
                              fullPhone = `00${vm.username.substring(1)}`;
                            } else if (!vm.username.startsWith("00")) {
                              fullPhone = `00${vm.username}`;
                            }
                          }
                          vm.requestLoginWithUsernameAndPwd(
                            fullPhone,
                            vm.password
                          ).catch((err) => {
                            Toast.error(err.msg);
                          });
                        }}
                      >
                        登录
                      </Button>
                    </div>
                    {/* <div className="xo-login-content-form-others">
                      <div
                        className="xo-login-content-form-scanlogin"
                        onClick={() => {
                          vm.loginType = LoginType.qrcode;
                        }}
                      >
                        扫描登录
                      </div>
                    </div> */}
                  </div>
                </div>
                <div
                  className={classNames(
                    "xo-login-content-scanlogin",
                    vm.loginType === LoginType.qrcode
                      ? "xo-login-content-scanlogin-show"
                      : undefined
                  )}
                >
                  <div className="xo-login-content-scanlogin-qrcode-title">
                    <h3>使用手机{XOApp.config.appName}扫码登录</h3>
                  </div>

                  <Spin size="large" spinning={vm.qrcodeLoading}>
                    <div className="xo-login-content-scanlogin-qrcode">
                      {vm.qrcodeLoading || !vm.qrcode ? undefined : (
                        <QRCode
                          value={vm.qrcode}
                          size={325}
                          fgColor='#000'
                        ></QRCode>
                      )}
                      {
                        <div
                          className={classNames(
                            "xo-login-content-scanlogin-qrcode-avatar",
                            vm.showAvatar()
                              ? "xo-login-content-scanlogin-qrcode-avatar-show"
                              : undefined
                          )}
                        >
                          {vm.showAvatar() ? (
                            <img src={XOApp.shared.avatarUser(vm.uid!)}></img>
                          ) : undefined}
                        </div>
                      }
                      {!vm.autoRefresh ? (
                        <div className="xo-login-content-scanlogin-qrcode-expire">
                          <p>二维码已失效，点击刷新</p>
                          <img
                            onClick={() => {
                              vm.reStartAdvance();
                            }}
                            src={require("./assets/refresh.png")}
                          ></img>
                        </div>
                      ) : undefined}
                    </div>
                  </Spin>

                  <div className="xo-login-content-scanlogin-qrcode-desc">
                    <ul>
                      <li>在手机上打开{XOApp.config.appName}</li>
                      <li>
                        进入 <b>消息</b> &nbsp; &gt; &nbsp; <b>+</b> &nbsp; &gt;
                        &nbsp;<b>扫一扫</b>
                      </li>
                      <li>将你的手机摄像头对准上面二维码进行扫描</li>
                      <li>在手机上确认登录</li>
                    </ul>
                  </div>
                  {/* <div className="xo-login-footer-buttons">
                    <button
                      onClick={() => {
                        vm.loginType = LoginType.phone;
                      }}
                    >
                      使用手机号登录
                    </button>
                  </div> */}
                </div>

                {/* <div className="xo-login-footer">
                        <ul>
                            <li>注册XOCHAT</li>
                            <li>忘记密码</li>
                            <li>隐私政策</li>
                            <li>用户协议</li>
                            <li> © 上海信必达网络科技有限公司</li>
                        </ul>

                    </div> */}
              </div>
            </div>
          );
        }}
      ></Provider>
    );
  }
}

export default Login;
