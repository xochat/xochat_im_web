import { Button, Spin, Toast } from "@douyinfe/semi-ui";
import { Channel, ChannelTypePerson } from "xochat_js_sdk";
import React, { Component, HTMLProps, ReactNode } from "react";
import { UserRelation } from "../../Service/Const";
import XOApp, { FriendApply } from "../../App";
import Provider, { IProviderListener } from "../../Service/Provider";
import { Section } from "../../Service/Section";
import RoutePage from "../RoutePage";
import Sections from "../Sections";
import "./index.css"
import { UserInfoRouteData, UserInfoVM } from "./vm";
import FriendApplyUI from "../FriendApply";
import RouteContext, { FinishButtonContext } from "../../Service/Context";
import { Image } from '@douyinfe/semi-ui';


export interface UserInfoProps extends HTMLProps<any>{
    uid: string
    fromChannel?: Channel // 从那个频道进来的
    sections?: Section[]
    vercode?: string // 验证码，加好友需要，证明好友来源
    onClose?: () => void
}

export default class UserInfo extends Component<UserInfoProps> {



    render() {
        const { uid, onClose, fromChannel, vercode } = this.props

        return <Provider create={() => {
            return new UserInfoVM(uid, fromChannel, vercode)
        }} render={(vm: UserInfoVM) => {
            return <RoutePage onClose={() => {
                if (onClose) {
                    onClose()
                }
            }} render={(context) => {
                return <div className="xo-userinfo">
                    <div className="xo-userinfo-content">
                        {
                            !vm.channelInfo ? <div className="xo-userinfo-loading">
                                <Spin></Spin>
                            </div> : (<>
                                <div className="xo-userinfo-header">
                                    <div className="xo-userinfo-user">
                                        <div className="xo-userinfo-user-avatar">
                                            <Image src={XOApp.shared.avatarUser(uid)}></Image>
                                        </div>
                                        <div className="xo-userinfo-user-info">
                                            <div className="xo-userinfo-user-info-name">
                                                {vm.displayName()}
                                            </div>
                                            <div className="xo-userinfo-user-info-others">
                                                <ul>
                                                    {
                                                        vm.showNickname() ? <li>
                                                            昵称： {vm.channelInfo?.title}
                                                        </li> : undefined
                                                    }
                                                    {
                                                        vm.showChannelNickname() ? <li>
                                                            群昵称： {vm.fromSubscriberOfUser?.remark}
                                                        </li> : undefined
                                                    }
                                                    {
                                                        vm.shouldShowShort() ? <li>
                                                            {XOApp.config.appName}号： {vm.channelInfo?.orgData.short_no}
                                                        </li> : undefined
                                                    }


                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="xo-userinfo-sections">
                                    <Sections sections={vm.sections(context)}></Sections>
                                </div>
                            </>)
                        }

                        <br></br>
                        <br></br>
                    </div>
                    {
                        vm.isSelf() ? undefined : <div className="xo-userInfo-footer">
                            <div className="xo-userinfo-footer-sendbutton">
                                {
                                    vm.relation() === UserRelation.friend ? <Button theme='solid' type="primary" onClick={() => {
                                        XOApp.shared.baseContext.hideUserInfo()
                                        XOApp.endpoints.showConversation(new Channel(vm.uid, ChannelTypePerson))
                                    }}>发送消息</Button> : <Button onClick={() => {
                                        let msg = "我是"
                                        if (vm.fromChannelInfo) {
                                            msg += `群聊"${vm.fromChannelInfo.title}"的${XOApp.loginInfo.name}`
                                        } else {
                                            msg += `${XOApp.loginInfo.name}`
                                        }
                                        var finishButtonContext: FinishButtonContext
                                        context.push(<FriendApplyUI placeholder={msg} onMessage={(m) => {
                                            msg = m
                                            if (!m || m === "") {
                                                finishButtonContext.disable(true)
                                            } else {
                                                finishButtonContext.disable(false)
                                            }
                                        }}></FriendApplyUI>, {
                                            title: "申请添加朋友",
                                            showFinishButton: true,
                                            onFinishContext: (ctx) => {
                                                finishButtonContext = ctx
                                                finishButtonContext.disable(false)
                                            },
                                            onFinish: async () => {
                                                finishButtonContext.loading(true)
                                                await XOApp.dataSource.commonDataSource.friendApply({
                                                    uid: vm.uid,
                                                    remark: msg,
                                                    vercode: vm.vercode || ""
                                                }).then(() => {
                                                    console.log("XOApp.shared.baseContext-->",XOApp.shared.baseContext)
                                                    XOApp.shared.baseContext.hideUserInfo()
                                                }).catch((err) => {
                                                    Toast.error(err.msg)
                                                })
                                                finishButtonContext.loading(false)
                                            }
                                        })
                                    }} >添加好友</Button>
                                }

                            </div>
                        </div>
                    }

                </div>
            }}></RoutePage>
        }}></Provider>

    }
}