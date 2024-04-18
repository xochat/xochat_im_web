import { Channel, ChannelInfo, ChannelTypePerson, XOSDK } from "xochat_js_sdk"
import { MessageCell } from '../MessageCell'
import { MessageWrap } from '../../Service/Model'
import XOApp from '../../App'
import React from 'react'
import "./index.css"
import { ChannelInfoListener } from "xochat_js_sdk"


export class RevokeCell extends MessageCell {
    channelInfoListener!:ChannelInfoListener

    componentDidMount() {
        const { message } = this.props
        this.channelInfoListener = (channelInfo:ChannelInfo) => {
            if(channelInfo.channel.channelType === ChannelTypePerson && channelInfo.channel.channelID === message.revoker) {
                this.setState({})
            }
        }
        XOSDK.shared().channelManager.addListener(this.channelInfoListener)
    }

    componentWillUnmount() {
        XOSDK.shared().channelManager.removeListener(this.channelInfoListener)
    }

    static tip(message: MessageWrap) {
        let name = "你"
        let revoker = message.revoker
        if (revoker === XOApp.loginInfo.uid) {
            if (revoker !== message.fromUID) {
                let memberFromName = "--"
                if (message.from) {
                    memberFromName = message.from.title;
                } else {
                    XOSDK.shared().channelManager.fetchChannelInfo(new Channel(message.fromUID, ChannelTypePerson))
                }
                return `${name}撤回了成员“${memberFromName}”的一条消息`
            }
            return `${name}撤回了一条消息`

        } else {
            const channel = new Channel(revoker ?? "", ChannelTypePerson)
            let channelInfo = XOSDK.shared().channelManager.getChannelInfo(new Channel(revoker ?? "", ChannelTypePerson))
            if (channelInfo) {
                name = channelInfo.title
            } else {
                XOSDK.shared().channelManager.fetchChannelInfo(channel)
                name = "--"
            }
            if (revoker !== message.fromUID) {
                return `${name}撤回了一条成员消息`
            }
            return `${name}撤回了一条消息`
        }
    }

    render() {
        const { message } = this.props
        return <div className="xo-message-system">{RevokeCell.tip(message)}</div>
    }
}