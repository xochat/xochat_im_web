import { Channel, ChannelTypeGroup, ChannelTypePerson, XOSDK, Message, MessageContentType } from "xochat_js_sdk";
import React from "react";
import { Component, ReactNode } from "react";
import { ImageContent } from "../../Messages/Image";
import MergeforwardContent from "../../Messages/Mergeforward";
import { dateFormat, getTimeStringAutoShort2 } from "../../Utils/time";
import WKAvatar from "../WKAvatar";
import WKViewQueueHeader from "../WKViewQueueHeader";
import XOApp from "../../App";

import "./index.css"


export interface MergeforwardMessageListProps {
    mergeforwardContent: MergeforwardContent
}

export default class MergeforwardMessageList extends Component<MergeforwardMessageListProps> {

    getTitle(content: MergeforwardContent) {
        if (content.channelType === ChannelTypeGroup) {
            return "群的聊天记录"
        }

        const names = content.users.map((v) => {
            return v.name
        })

        return `${names.join("、")}的聊天记录`

    }

    getTimeline(content: MergeforwardContent) {
        if (!content.msgs || content.msgs.length === 0) {
            return ""
        }
        if (content.msgs.length === 1) {
            const msg = content.msgs[0]
            return dateFormat(new Date(msg.timestamp * 1000), "yyyy-MM-dd")
        }
        const firstMsg = content.msgs[0]
        const lastMsg = content.msgs[content.msgs.length - 1]

        return `${dateFormat(new Date(firstMsg.timestamp * 1000), "yyyy-MM-dd")} ~ ${dateFormat(new Date(lastMsg.timestamp * 1000), "yyyy-MM-dd")}`
    }

    imageScale(orgWidth: number, orgHeight: number, maxWidth = 250, maxHeight = 250) {
        let actSize = { width: orgWidth, height: orgHeight };
        if (orgWidth > orgHeight) {//横图
            if (orgWidth > maxWidth) { // 横图超过最大宽度
                let rate = maxWidth / orgWidth; // 缩放比例
                actSize.width = maxWidth;
                actSize.height = orgHeight * rate;
            }
        } else if (orgWidth < orgHeight) { //竖图
            if (orgHeight > maxHeight) {
                let rate = maxHeight / orgHeight; // 缩放比例
                actSize.width = orgWidth * rate;
                actSize.height = maxHeight;
            }
        } else if (orgWidth === orgHeight) {
            if (orgWidth > maxWidth) {
                let rate = maxWidth / orgWidth; // 缩放比例
                actSize.width = maxWidth;
                actSize.height = orgHeight * rate;
            }
        }
        return actSize;
    }
    getImageSrc(content:ImageContent) {
        if (content.url && content.url !== "") { // 等待发送的消息
            return XOApp.dataSource.commonDataSource.getImageURL(content.url, { width: content.width, height: content.height })
        }
        return content.imgData
    }

    getMsgContent(msg:Message) {
        if(msg.contentType === MessageContentType.image) {
           const imageContent = msg.content as ImageContent
           const size = this.imageScale(imageContent.width,imageContent.height)

           return <img style={{"width":`${size.width}px`,"height":`${size.height}px`,borderRadius:"4px"}} src={this.getImageSrc(imageContent)}>
           </img>
        }
        return msg.content.conversationDigest
    }

    render(): ReactNode {
        const { mergeforwardContent } = this.props
        return <div className="xo-mergeforwardmessagelist">
            <div className="xo-mergeforwardmessagelist-header">
                <WKViewQueueHeader hideBack={true} title={this.getTitle(mergeforwardContent)}></WKViewQueueHeader>
            </div>
            <div className="xo-mergeforwardmessagelist-content">
                <div className="xo-mergeforwardmessagelist-content-timeline">
                    {this.getTimeline(mergeforwardContent)}
                </div>
                <div className="xo-mergeforwardmessagelist-content-msgs">
                    {
                        mergeforwardContent.msgs.map((m,i) => {
                            const fromChannel = new Channel(m.fromUID, ChannelTypePerson)
                            let fromChannelInfo = XOSDK.shared().channelManager.getChannelInfo(fromChannel)
                            if(!fromChannelInfo) {
                                XOSDK.shared().channelManager.fetchChannelInfo(fromChannel)
                            }
                            let showAvatar = true
                            if(i > 0) {
                                showAvatar = mergeforwardContent.msgs[i-1].fromUID !== m.fromUID
                            }
                            return <div className="xo-mergeforwardmessagelist-content-msg" key={m.messageID}>
                                <div className="xo-mergeforwardmessagelist-content-msg-avatar" style={{ "width": "40px", "height": "40px", "borderRadius": "50%" }}>
                                    {
                                        showAvatar?<WKAvatar channel={new Channel(m.fromUID, ChannelTypePerson)} style={{ "width": "40px", "height": "40px", "borderRadius": "50%" }}></WKAvatar>:undefined
                                    }
                                </div>
                                <div className="xo-mergeforwardmessagelist-content-msg-info">
                                    <div className="xo-mergeforwardmessagelist-content-msg-info-first">
                                        <div className="xo-mergeforwardmessagelist-content-msg-info-first-name">
                                            {fromChannelInfo?.title}
                                        </div>
                                        <div className="xo-mergeforwardmessagelist-content-msg-info-first-time">
                                                {getTimeStringAutoShort2(m.timestamp*1000,true)}
                                        </div>
                                    </div>
                                    <div className="xo-mergeforwardmessagelist-content-msg-info-second">
                                           <div className="xo-mergeforwardmessagelist-content-msg-info-second-msgcontent">
                                           {
                                               this.getMsgContent(m)
                                            }
                                           </div>
                                    </div>
                                </div>
                            </div>
                        })
                    }

                </div>
            </div>
        </div>
    }
}