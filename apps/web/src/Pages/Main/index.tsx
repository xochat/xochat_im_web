import { XOApp, WKLayout, Provider } from "@xochat/base";
import React, { Component } from "react";
import "./index.css"
import MainVM from "./vm";
import { TabNormalScreen } from "./tab_normal_screen";


export interface MainContentLeftProps {
    vm: MainVM
}

export interface MainContentLeftState {
}
export class MainContentLeft extends Component<MainContentLeftProps, MainContentLeftState>{
    constructor(props: any) {
        super(props)
        this.state = {
        }
    }


    render() {
        const { vm } = this.props

        return <>
            {
                vm.historyRoutePaths.map((routePath,i) => {
                    const cpt = XOApp.route.get(routePath)
                    return <div key={i} style={{"display":routePath === vm.currentMenus?.routePath?"block":"none","width":"100%","height":"100%"}}>
                        {cpt}
                    </div>
                })
            }
        </>
    }
}

export class MainPage extends Component {

    render() {
        return <Provider create={() => {
            return new MainVM()
        }} render={(vm: MainVM) => {
            return <WKLayout onRenderTab={(size) => {
                // if (size === ScreenSize.small) {
                //     return <TabLowScreen vm={vm}></TabLowScreen>
                // }
                return <TabNormalScreen vm={vm} />
            }} contentLeft={<MainContentLeft vm={vm}/>} onRightContext={(context)=>{
                XOApp.routeRight.setPush = (view)=>{
                    context.push(view)
                }
                XOApp.routeRight.setReplaceToRoot = (view) => {
                    context.replaceToRoot(view)
                }
                XOApp.routeRight.setPop = ()=> {
                    context.pop()
                }
                XOApp.routeRight.setPopToRoot = () => {
                    context.popToRoot()
                }
            }} onLeftContext={(context)=>{
                XOApp.routeLeft.setPush = (view)=>{
                    context.push(view)
                }
                XOApp.routeLeft.setReplaceToRoot = (view) => {
                    context.replaceToRoot(view)
                }
                XOApp.routeLeft.setPop = ()=> {
                    context.pop()
                }
                XOApp.routeLeft.setPopToRoot = () => {
                    context.popToRoot()
                }
            }} contentRight={ <div className="wk-chat-empty">
            <img src={require("./assets/start_chat.svg").default} alt=""></img>
        </div>} />
        }}>

        </Provider>
    }
}