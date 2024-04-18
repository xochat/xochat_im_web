import { Channel, XOSDK, Subscriber } from "xochat_js_sdk";
import React from "react";
import { Component } from "react";
import Provider from "../../Service/Provider";
import XOApp from "../../App";
import "./index.css"
import { SubscribersVM } from "./vm";
import IndexTable, { IndexTableItem } from "../IndexTable";
import WKBase,{ WKBaseContext } from "../WKBase";
import RouteContext, { RouteContextConfig } from "../../Service/Context";

export interface SubscribersProps {
    context: RouteContext<any>
    onAdd?: ()=>void
    onRemove?:()=>void
}

export class Subscribers extends Component<SubscribersProps> {
    baseContext!:WKBaseContext

    subscriberUI(subscriber: Subscriber) {
        return <div key={subscriber.uid} className="xo-subscribers-item" onClick={()=>{
            const vercode = subscriber.orgData?.vercode
            XOApp.shared.baseContext.showUserInfo(subscriber.uid,subscriber.channel,vercode)
        }}>
            <img src={XOApp.shared.avatarUser(subscriber.uid)}></img>
            <div className="xo-subscribers-item-name">{subscriber.remark || subscriber.name}</div>
        </div>
    }

    render() {
        const { context,onAdd,onRemove } = this.props
        return <Provider create={() => {
            return new SubscribersVM(context)
        }} render={(vm: SubscribersVM) => {
            return <WKBase onContext={(baseContext)=>{
                this.baseContext = baseContext
            }}>
                <div className="xo-subscribers">
                <div className="xo-subscribers-content">
                    {
                        vm.subscribersTop.map((subscriber) => {
                            return this.subscriberUI(subscriber)
                        })
                    }
                    {
                        vm.showAdd() ? <div className="xo-subscribers-item" onClick={()=>{
                            if(onAdd) {
                                onAdd()
                            }
                        }}>
                            <img src={require("./assets/icon_add_more_gray.png")}></img>
                        </div> : undefined
                    }
                    {
                        vm.showRemove() ? <div className="xo-subscribers-item" onClick={()=>{
                            if(onRemove){
                                onRemove()
                            }
                        }}>
                            <img src={require("./assets/icon_delete_more_gray.png")}></img>
                        </div> : undefined
                    }
                </div>
                {
                    vm.hasMoreSubscribers() ? <div className="xo-subscribers-more" onClick={()=>{
                        context.push(<IndexTable items={vm.subscribers.map((s)=>{
                            return new IndexTableItem(s.uid,s.remark || s.name,XOApp.shared.avatarUser(s.uid))
                        })}></IndexTable>,new RouteContextConfig({
                            title: "成员列表",
                        }))
                    }}>
                        查看更多群成员
                    </div> : undefined
                }
            </div>
            </WKBase>
        }}>

        </Provider>

    }
}