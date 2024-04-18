import React, { Component, ReactNode } from "react";
import { Conversation } from "../../Components/Conversation";
import ConversationList from "../../Components/ConversationList";
import Provider from "../../Service/Provider";

import { Spin, Button, Popover } from '@douyinfe/semi-ui';
import { IconPlus } from '@douyinfe/semi-icons';
import { ChatVM } from "./vm";
import "./index.css"
import { ConversationWrap } from "../../Service/Model";
import XOApp, { ThemeMode } from "../../App";
import ChannelSetting from "../../Components/ChannelSetting";
import classNames from "classnames";
import { Channel, ChannelInfo, XOSDK } from "xochat_js_sdk";
import { ChannelInfoListener } from "xochat_js_sdk";
import { ChatMenus } from "../../App";
import ConversationContext from "../../Components/Conversation/context";


export interface ChatContentPageProps {
    channel: Channel
    initLocateMessageSeq?: number
}

export interface ChatContentPageState {
    showChannelSetting: boolean
}
export class ChatContentPage extends Component<ChatContentPageProps, ChatContentPageState> {
    channelInfoListener!: ChannelInfoListener
    conversationContext!: ConversationContext
    constructor(props: any) {
        super(props)
        this.state = {
            showChannelSetting: false,
        }
    }

    componentDidMount() {
        const { channel } = this.props
        this.channelInfoListener = (channelInfo: ChannelInfo) => {
            if (channelInfo.channel.isEqual(channel)) {
                this.setState({})
            }
        }
        XOSDK.shared().channelManager.addListener(this.channelInfoListener)

    }

    componentWillUnmount() {
        XOSDK.shared().channelManager.removeListener(this.channelInfoListener)
    }

    render(): React.ReactNode {
        const { channel, initLocateMessageSeq } = this.props
        const { showChannelSetting } = this.state
        const channelInfo = XOSDK.shared().channelManager.getChannelInfo(channel)
        if (!channelInfo) {
            XOSDK.shared().channelManager.fetchChannelInfo(channel)
        }
        return <div className={classNames("xo-chat-content-right", showChannelSetting ? "xo-chat-channelsetting-open" : "")}>
            <div className="xo-chat-content-chat">
                <div className="xo-chat-conversation-header" onClick={() => {
                    this.setState({
                        showChannelSetting: !this.state.showChannelSetting
                    })
                }}>
                    <div className="xo-chat-conversation-header-content">
                        <div className="xo-chat-conversation-header-left">
                            <div className="xo-chat-conversation-header-back" onClick={(e) => {
                                e.stopPropagation()
                                XOApp.routeRight.pop()
                            }}>
                                <div className="xo-chat-conversation-header-back-icon"></div>
                            </div>
                            <div className="xo-chat-conversation-header-channel">
                                <div className="xo-chat-conversation-header-channel-avatar">
                                    <img src={XOApp.shared.avatarChannel(channel)}></img>
                                </div>
                                <div className="xo-chat-conversation-header-channel-info">
                                    <div className="xo-chat-conversation-header-channel-info-name">
                                        {
                                            channelInfo?.orgData?.displayName
                                        }
                                    </div>
                                    <div className="xo-chat-conversation-header-channel-info-tip">

                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="xo-chat-conversation-header-right">
                            {
                                XOApp.endpoints.channelHeaderRightItems(channel).map((item:any,i:number) => {
                                    return <div  key={i} className="xo-chat-conversation-header-right-item">
                                        {
                                            item
                                        }
                                    </div>
                                })
                            }
                            <div className="xo-chat-conversation-header-right-item">
                                <svg fill={XOApp.config.themeColor} height="28px" role="presentation" viewBox="0 0 36 36" width="28px"><path clipRule="evenodd" d="M18 29C24.0751 29 29 24.0751 29 18C29 11.9249 24.0751 7 18 7C11.9249 7 7 11.9249 7 18C7 24.0751 11.9249 29 18 29ZM19.5 18C19.5 18.8284 18.8284 19.5 18 19.5C17.1716 19.5 16.5 18.8284 16.5 18C16.5 17.1716 17.1716 16.5 18 16.5C18.8284 16.5 19.5 17.1716 19.5 18ZM23 19.5C23.8284 19.5 24.5 18.8284 24.5 18C24.5 17.1716 23.8284 16.5 23 16.5C22.1716 16.5 21.5 17.1716 21.5 18C21.5 18.8284 22.1716 19.5 23 19.5ZM14.5 18C14.5 18.8284 13.8284 19.5 13 19.5C12.1716 19.5 11.5 18.8284 11.5 18C11.5 17.1716 12.1716 16.5 13 16.5C13.8284 16.5 14.5 17.1716 14.5 18Z" fillRule="evenodd"></path></svg>
                                <div className="xo-conversation-header-mask">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="xo-chat-conversation">
                    <Conversation initLocateMessageSeq={initLocateMessageSeq} shouldShowHistorySplit={true} onContext={(ctx) => {
                        this.conversationContext = ctx
                        this.setState({})
                    }} key={channel.getChannelKey()} chatBg={XOApp.config.themeMode === ThemeMode.dark ? undefined : require("./assets/chat_bg.svg").default} channel={channel}></Conversation>
                </div>
            </div>

            <div className={classNames("xo-chat-channelsetting")}>
                <ChannelSetting conversationContext={this.conversationContext} key={channel.getChannelKey()} channel={channel} onClose={() => {
                    this.setState({
                        showChannelSetting: false
                    })
                }}></ChannelSetting>
            </div>
        </div>
    }
}

export default class ChatPage extends Component<any> {
    vm!: ChatVM
    constructor(props: any) {
        super(props)
    }

    componentDidMount() {

        // XOApp.routeMain.replaceToRoot(<ChatContentPage vm={this.vm}></ChatContentPage>)
    }

    componentWillUnmount() {
    }

    render(): ReactNode {
        return <Provider create={() => {
            this.vm = new ChatVM()
            return this.vm
        }} render={(vm: ChatVM) => {
            return <div className="xo-chat">
                <div className={classNames("xo-chat-content", vm.selectedConversation ? "xo-conversation-open" : undefined)}>
                    <div className="xo-chat-content-left">
                        <div className="xo-chat-search">
                            <div className="xo-chat-title">
                                {vm.connectTitle}
                            </div>
                            <Popover onClickOutSide={() => {
                                vm.showAddPopover = false
                            }} className="xo-chat-popover" position="bottomRight" visible={vm.showAddPopover} showArrow={false} trigger="custom" content={<ChatMenusPopover onItem={() => {
                                vm.showAddPopover = false
                            }}></ChatMenusPopover>}>
                                <div className="xo-chat-search-add" onClick={() => {
                                    vm.showAddPopover = !vm.showAddPopover
                                }}>
                                    <IconPlus size="large"></IconPlus>
                                </div>
                                {/* <Button icon={<IconPlus></IconPlus>} onClick={() => {
                                    vm.showAddPopover = true
                                }}></Button> */}
                            </Popover>
                        </div>
                        <div className="xo-chat-conversation-list">
                            {
                                vm.loading ? <div className="xo-chat-conversation-list-loading">
                                    <Spin style={{ marginTop: "20px" }} />
                                </div> :
                                    <ConversationList select={XOApp.shared.openChannel} conversations={vm.conversations} onClick={(conversation: ConversationWrap) => {
                                        vm.selectedConversation = conversation
                                        XOApp.endpoints.showConversation(conversation.channel)
                                        vm.notifyListener()
                                    }}></ConversationList>
                            }
                        </div>
                    </div>
                </div>
            </div>
        }} />
    }
}


interface ChatMenusPopoverState {
    chatMenus: ChatMenus[]
}

interface ChatMenusPopoverProps {
    onItem?: (menus: ChatMenus) => void
}
class ChatMenusPopover extends Component<ChatMenusPopoverProps, ChatMenusPopoverState> {
    constructor(props: any) {
        super(props)
        this.state = {
            chatMenus: [],
        }
    }
    componentDidMount() {
        this.setState({
            chatMenus: XOApp.shared.chatMenus()
        })
    }

    render(): React.ReactNode {
        const { chatMenus } = this.state
        const { onItem } = this.props
        return <div className="xo-chatmenuspopover">
            <ul>
                {
                    chatMenus.map((c, i) => {
                        return <li key={i} onClick={() => {
                            if (c.onClick) {
                                c.onClick()
                            }
                            if (onItem) {
                                onItem(c)
                            }
                        }}>
                            <div className="xo-chatmenuspopover-avatar">
                                <img src={c.icon}></img>
                            </div>
                            <div className="xo-chatmenuspopover-title">
                                {c.title}
                            </div>
                        </li>
                    })
                }
            </ul>
        </div>
    }
}
