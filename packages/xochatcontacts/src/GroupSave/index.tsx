import { XOApp, WKViewQueueHeader, Provider } from "@xochat/base";
import React from "react";
import { Component, ReactNode } from "react";
import "./index.css"
import { GroupSaveVM } from "./vm";
import { Button,Toast } from "@douyinfe/semi-ui";
import { IndexTableItem,ContactsSelect } from "@xochat/base";
import { FinishButtonContext } from "@xochat/base/src/Service/Context";

export default class GroupSave extends Component {

    render(): ReactNode {
        return <Provider create={()=>{
            return new GroupSaveVM()
        }} render={(vm:GroupSaveVM)=>{
            return <div className="wk-groupsave">
            <WKViewQueueHeader title="保存的群" onBack={() => {
                XOApp.routeLeft.pop()
            }} action={<div  className="wk-viewqueueheader-content-action">
                    <Button size="small" onClick={()=>{
                         var selectItems: IndexTableItem[]
                         var finishButtonContext: FinishButtonContext
                         XOApp.routeLeft.push(<ContactsSelect showFinishButton={true} onFinishButtonContext={(context) => {
                             finishButtonContext = context
                         }} onSelect={(items) => {
                             selectItems = items
                         }} showHeader={true} onBack={() => {
                             XOApp.routeLeft.pop()
                         }} onFinished={() => {
                             if (selectItems && selectItems.length > 0) {
                                 finishButtonContext.loading(true)
                                 XOApp.dataSource.channelDataSource.createChannel(selectItems.map((item) => {
                                     return item.id
                                 })).then(() => {
                                     finishButtonContext.loading(false)
                                     XOApp.routeLeft.pop()
                                 }).catch((err) => {
                                     Toast.error(err.msg)
                                     finishButtonContext.loading(false)
                                 })
                             }
                         }}></ContactsSelect>)
                    }} >新建群</Button>
            </div>}></WKViewQueueHeader>
            <div className="wk-groupsave-content">
                <ul>
                    {
                        vm.groups.map((g)=>{
                            return  <li key={g.channel.channelID} onClick={()=>{
                                XOApp.endpoints.showConversation(g.channel)
                            }}>
                                <div className="wk-groupsave-content-avatar">
                                    <img src={XOApp.shared.avatarChannel(g.channel)}></img>
                                </div>
                                <div className="wk-groupsave-content-title">{g.title}</div>
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