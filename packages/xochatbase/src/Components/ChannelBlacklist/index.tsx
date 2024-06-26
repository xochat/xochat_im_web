import { Toast } from "@douyinfe/semi-ui";
import { SubscriberChangeListener } from "xochat_js_sdk";
import { XOSDK } from "xochat_js_sdk";
import React from "react";
import { Component, ReactNode } from "react";
import XOApp from "../../App";
import { GroupRole, SubscriberStatus } from "../../Service/Const";
import RouteContext, { FinishButtonContext } from "../../Service/Context";
import { ChannelSettingRouteData } from "../ChannelSetting/context";
import { IndexTableItem } from "../IndexTable";
import SmallTableEdit from "../SmallTableEdit";
import UserSelect from "../UserSelect";

import "./index.css"


export interface ChannelBlacklistProps {
    routeContext: RouteContext<ChannelSettingRouteData>
}
export default class ChannelBlacklist extends Component<ChannelBlacklistProps> {
    subscriberChangeListener!: SubscriberChangeListener

    componentDidMount() {
        this.subscriberChangeListener = () => {
            this.setState({})
        }
        XOSDK.shared().channelManager.addSubscriberChangeListener(this.subscriberChangeListener)
    }

    componentWillUnmount() {
        XOSDK.shared().channelManager.removeSubscriberChangeListener(this.subscriberChangeListener)
    }

    render(): ReactNode {
        const { routeContext } = this.props
        const data = routeContext.routeData()
        return <div className="xo-channelblacklist">
            <SmallTableEdit addTitle="添加黑名单" items={data.subscriberAll.filter((s) => s.status === SubscriberStatus.blacklist).map((subscriber) => {
                return {
                    id: subscriber.uid,
                    icon: subscriber.avatar,
                    name: subscriber.remark || subscriber.name,
                    showAction: true,
                    onAction: () => {
                        XOApp.dataSource.channelDataSource.blacklistRemove(data.channel,[subscriber.uid]).catch((err)=>{
                            Toast.error(err.msg)
                        })
                    }
                }
            })} onAdd={() => {
                var btnContext: FinishButtonContext
                var selectItems: IndexTableItem[] = []
                routeContext.push(<UserSelect onSelect={(items) => {
                    if (items.length === 0) {
                        btnContext.disable(true)
                    } else {
                        btnContext.disable(false)
                    }
                    selectItems = items

                }} users={data.subscribers.filter((subscriber) => subscriber.role !== GroupRole.manager && subscriber.role !== GroupRole.owner && subscriber.status === SubscriberStatus.normal).map((item) => {
                    return new IndexTableItem(item.uid, item.name, item.avatar)
                })}></UserSelect>, {
                    title: "选择成员",
                    showFinishButton: true,
                    onFinish: async () => {
                        btnContext.loading(true)
                        await XOApp.dataSource.channelDataSource.blacklistAdd(data.channel, selectItems.map((item) => {
                            return item.id
                        })).catch((err) => {
                            Toast.error(err.msg)
                        })
                        btnContext.loading(false)
                        routeContext.pop()
                    },
                    onFinishContext: (context) => {
                        btnContext = context
                        btnContext.disable(true)
                    }
                })
            }}></SmallTableEdit>
        </div>
    }
}