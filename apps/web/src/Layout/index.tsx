import React, { Component } from "react";
import { XOApp, WKBase, Provider } from "@xochat/base"
import { listen } from '@tauri-apps/api/event'
// import Provider from "limbase/src/Service/Provider";
import { MainPage } from "../Pages/Main";
import { Notification as NotificationUI, Button } from '@douyinfe/semi-ui';
import { UpdateManifest, checkUpdate, installUpdate } from '@tauri-apps/api/updater'
import { relaunch } from '@tauri-apps/api/process'
import { os } from "@tauri-apps/api";


export default class AppLayout extends Component {
    onLogin!: () => void
    componentDidMount() {
        this.onLogin = () => {
            console.log("登录成功！")
            window.location.href = "./index.html"

            Notification.requestPermission() // 请求通知权限
        }
        XOApp.endpoints.addOnLogin(this.onLogin)


        this.tauriCheckUpdate()

    }

    componentWillUnmount() {
        XOApp.endpoints.removeOnLogin(this.onLogin)
    }

    async tauriCheckUpdate() {
        if(!(window as any).__TAURI_IPC__) {
            return
        }

        listen('tauri://update-status', function (res) {
            console.log('New status: ', res)
        })


        try {
            const { shouldUpdate, manifest } = await checkUpdate()
            if (shouldUpdate) {
                // display dialog
                console.log(`Installing update ${manifest.version}, ${manifest?.date}, ${manifest.body}`);
                if(await os.platform() === "darwin") { // mac 自动下载更新
                    await installUpdate()
                }
                this.showUpdateUI(manifest)
                
            }
            console.log("manifest---->", manifest)
        } catch (error) {
            console.log(error)
        }
    }

    showUpdateUI(manifest: UpdateManifest) {
      const notifyID =  NotificationUI.info({
            title: `有新版本 ${manifest.version}`,
            duration: 0,
            content: (
                <>
                    <div>{manifest.body}</div>
                    <div style={{ marginTop: 8 }}>
                        <Button onClick={ async () => {
                           // install complete, restart app
                           if(await os.platform() !== "darwin") { 
                                await installUpdate()
                            }
                          await relaunch()
                        }}>更新</Button>
                        <Button onClick={()=>{
                            NotificationUI.close(notifyID)
                        }} type="secondary" style={{ marginLeft: 20 }}>
                            下次
                        </Button>
                    </div>
                </>
            ),
        })
    }

    showProgressUI() {

    }

    render() {
        return <Provider create={() => {
            return XOApp.shared
        }} render={(vm: XOApp): any => {
            console.log(window.location.pathname,'window.location.pathname')
            if (!XOApp.shared.isLogined() || window.location.pathname === '/login') {
                const loginComponent = XOApp.route.get("/login")
                if (!loginComponent) {
                    return <div>没有登录模块！</div>
                }
                return loginComponent
            }
            console.log("goto main---->")
            return <WKBase onContext={(ctx) => {
                console.log("goto main----111>", ctx)
                XOApp.shared.baseContext = ctx
            }}>
                <MainPage />
            </WKBase>
        }} />

    }
}