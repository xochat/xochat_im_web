import { XOApp, Menus, ThemeMode,MeInfo } from "@xochat/base";
import classnames from "classnames";
import React from "react";
import { Component } from "react";
import MainVM, { VersionInfo } from "./vm";
import "./tab_normal_screen.scss"
import { Badge, Modal, Toast } from "@douyinfe/semi-ui";

export interface TabNormalScreenProps {
    vm: MainVM
}

export class TabNormalScreen extends Component<TabNormalScreenProps> {

    componentDidMount() {
        XOApp.menus.setRefresh = () => {
            this.setState({})
        }
    }
    render(){
        const { vm } = this.props
        return <div className="xo-main-sider">
            <ul className="xo-main-sider-content">
                <li className="xo-main-sider-avatar" onClick={()=>{
                    vm.showMeInfo = true
                }}>
                    <img alt="" src={XOApp.shared.avatarUser(XOApp.loginInfo.uid || "")}></img>
                </li>
                {
                    vm.menusList.map((menus: Menus) => {
                        return <li className="xo-main-sider-item" title={menus.title} key={menus.id} onClick={() => {
                            vm.currentMenus = menus
                            if (menus.onPress) {
                                menus.onPress()
                            } else {
                                XOApp.routeLeft.popToRoot()
                                //  XOApp.route.push(menus.routePath)
                            }

                        }}>
                            {
                                menus.badge && menus.badge > 0 ? <div className="xo-main-sider-item-badge">
                                    <Badge count={menus.badge} type='danger'></Badge>
                                </div> : undefined
                            }
                            {
                                menus.id === vm.currentMenus?.id ? menus.selectedIcon : menus.icon
                            }
                        </li>
                    })
                }

                <li className="xo-main-sider-setting-box" onClick={() => {
                    vm.settingSelected = !vm.settingSelected
                }}>
                    {
                        vm.hasNewVersion ? <div className="xo-main-sider-setting-badge">
                            <Badge type="danger" dot> </Badge>
                        </div> : undefined
                    }
                    <div className={classnames("xo-main-sider-setting", vm.settingSelected ? "collapsed" : undefined)}>
                        <span className="xo-sider-setting-position-re xo-icon-bar"></span>
                        <span className="xo-icon-bar"></span>
                        <span className="xo-sider-setting-position-re xo-icon-bar"></span>
                    </div>

                </li>
            </ul>
            <ul className={classnames("xo-sider-setting-list", vm.settingSelected ? "open" : undefined)}>
                <li onClick={() => {
                    vm.settingSelected = false
                    if (XOApp.config.themeMode === ThemeMode.dark) {
                        XOApp.config.themeMode = ThemeMode.light
                    } else {
                        XOApp.config.themeMode = ThemeMode.dark
                    }
                }}>
                    <img src={require('./assets/dark.png')} alt="" />
                    {`${XOApp.config.themeMode === ThemeMode.dark ? "关闭" : "打开"}黑暗模式`}</li>
                <li onClick={() => {
                    vm.settingSelected = false
                    if (vm.hasNewVersion) {
                        vm.showNewVersion = true
                    } else {
                        Toast.success("已经是最新版本")
                    }

                }}>
                    <img src={require('./assets/update.png')} alt="" />
                    检查版本&nbsp;v{XOApp.config.appVersion}&nbsp;
                    {
                        vm.hasNewVersion ? <Badge dot type="danger"></Badge> : undefined
                    }
                </li>
                <li onClick={() => {
                    vm.settingSelected = false
                    XOApp.shared.notificationIsClose = !XOApp.shared.notificationIsClose
                }}>
                    <img src={require('./assets/close.png')} alt="" />
                    {XOApp.shared.notificationIsClose ? "打开" : "关闭"}桌面通知</li>
                <li onClick={() => {
                    vm.settingSelected = false
                    XOApp.shared.logout()
                }}>
                    <img src={require('./assets/login.png')} alt="" />
                    退出登录</li>
            </ul>
            <Modal title="检测到新版本信息" visible={vm.showNewVersion} footer={null} onCancel={() => {
                vm.showNewVersion = false
            }}>
                {
                    vm.lastVersionInfo ? <VersionCheckView lastVersion={vm.lastVersionInfo}/> : undefined
                }

            </Modal>

            <Modal width={400} className="xo-main-sider-modal xo-main-sider-meinfo" footer={null} closeIcon={<div></div>}  visible={vm.showMeInfo} mask={false} onCancel={() => {
               vm.showMeInfo = false
            }}>
                <MeInfo onClose={()=>{
                    vm.showMeInfo = false
                }}></MeInfo>

            </Modal>
        </div>
    }
}


interface VersionCheckViewProps {
    lastVersion: VersionInfo // 最新版本
}
class VersionCheckView extends Component<VersionCheckViewProps>{

    render() {
        const { lastVersion } = this.props
        return <div className="xo-versioncheckview">
            <div className="xo-versioncheckview-content">
                <div className="xo-versioncheckview-updateinfo">
                    <ul>
                        <li>当前版本: {XOApp.config.appVersion} &nbsp;&nbsp;目标版本: {lastVersion.appVersion}</li>
                        <li>更新内容：</li>
                        <li>
                            <pre>
                                {
                                    lastVersion.updateDesc
                                }
                            </pre>
                        </li>
                    </ul>
                </div>
                <div className="xo-versioncheckview-tip">
                    <div className="xo-versioncheckview-tip-title">
                        更新方法：
                    </div>
                    <div className="xo-versioncheckview-tip-content">
                        <ul>
                            <li>
                                1. Windows系统中的某些浏览器: Ctrl + F5刷新。如Chrome谷
                                歌、Opera欧鹏、FireFox火狐浏览器等。
                            </li>
                            <li>
                                2. MacOS系统的Safari浏览器: Command + Option + R刷新。
                            </li>
                            <li>
                                3. MacOS系统中的某些浏览器: Command + Shift + R刷新。如Chrome谷歌、Opera欧鹏、 FireFox火狐浏览器等 。
                            </li>
                            <li>
                                {`4.浏览器打开"设置" -> "清理浏览数据" ->勾选"缓存的图片和
文件”(其他不勾选) -> "清理" ->刷新页面。`}
                            </li>
                            <li>
                                5.若上述方法都不行，请直接清理浏览器的数据或缓存。
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    }
}