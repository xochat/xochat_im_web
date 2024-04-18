import { XOApp, WKViewQueueHeader, Provider } from "@xochat/base";
import React from "react";
import { Component, ReactNode } from "react";
import "./index.css"
import BlacklistVM from "./vm";

export default class Blacklist extends Component {

    render(): ReactNode {

        return <Provider create={() => {
            return new BlacklistVM()
        }} render={(vm: BlacklistVM) => {
            return <div className="xo-blacklist">
                <WKViewQueueHeader title="黑名单" onBack={() => {
                    XOApp.routeLeft.pop()
                }}></WKViewQueueHeader>
                <div className="xo-blacklist-content">
                    <ul>
                        {
                            vm.blacklist().map((b) => {
                                return <li key={b.uid} onClick={()=>{
                                    XOApp.shared.baseContext.showUserInfo(b.uid)
                                }}>
                                    <div className="xo-blacklist-content-avatar">
                                        <img src={XOApp.shared.avatarUser(b.uid)}></img>
                                    </div>
                                    <div className="xo-blacklist-content-title">{b.name}</div>
                                </li>
                            })
                        }

                    </ul>
                </div>
            </div>
        }}>
        </Provider>
    }
}