import classNames from "classnames";
import React from "react";
import XOApp from "../../App";
import { Part, PartType } from "../../Service/Model";
import MessageBase from "../Base";
import MessageHead from "../Base/head";
import MessageTrail from "../Base/tail";
import { MessageCell } from "../MessageCell";
import "./index.css"


// 文本消息
export class TextCell extends MessageCell {
    constructor(props: any) {
        super(props)
    }

    getCommonText(k: number, part: Part) {
        const texts = part.text.split("\n")
        const { message } = this.props
        return <span key={`${message.clientMsgNo}-text-${k}`} className="xo-message-text-commontext">
            {
                texts.map((text, i) => {
                    return <span key={`${message.clientMsgNo}-common-${i}`} className="xo-message-text-richtext">{text}{i !== texts.length - 1 ? <br /> : undefined}</span>
                })
            }
        </span>
    }

    getMentionText(k: number, part: Part) {
        const { message,context } = this.props
        return <span onClick={()=>{
            if(part.data?.uid) {
                context.showUser(part.data?.uid)
            }
        }} key={`${message.clientMsgNo}-mention-${k}`} className={classNames("xo-message-text-richmention", message.send ? "xo-message-text-send" : "xo-message-text-recv")}>{part.text}</span>
    }

    getEmojiText(k: number, part: Part) {
        const { message } = this.props
        const emojiURL = XOApp.emojiService.getImage(part.text)
        return <span key={`${message.clientMsgNo}-emoji-${k}`} className="xo-message-text-richemoji">{emojiURL !== ""?<img alt="" src={emojiURL} />:part.text}</span>
    }

    getLinkText(k: number, part: Part) {
        const { message } = this.props
        let link = part.text
        if(link.indexOf("http") !== 0) {
            link = "http://" + link
        }
        return <a  key={`${message.clientMsgNo}-link-${k}`} href={link} target="__blank">{part.text}</a>
    }

    getRenderMessageText() {
        const { message } = this.props
        const parts = message.parts
        const elements = new Array<JSX.Element>()
        if (parts && parts.length > 0) {
            let i = 0
            for (const part of parts) {
                part.text.split("\n")
                if (part.type === PartType.text) {
                   elements.push(this.getCommonText(i, part))
                } else if (part.type === PartType.mention) {
                    elements.push(this.getMentionText(i, part))
                } else if (part.type === PartType.emoji) {
                   elements.push(this.getEmojiText(i, part))
                }else if(part.type === PartType.link) {
                    elements.push(this.getLinkText(i,part))
                }
                i++
            }
        }
        return elements
    }

    render() {
        const { message, context } = this.props
        return <MessageBase message={message} context={context} onBubble={() => {
        }}>
            <MessageHead message={message} />
            {
                message?.content.reply ? <div className={classNames("xo-message-text-reply",message.send?undefined:"xo-message-text-reply-recv")} onClick={()=>{
                    context.locateMessage( message?.content.reply.messageSeq)
                }}>
                    <div className="xo-message-text-reply-author">
                        <div className="xo-message-text-reply-authoravatar">
                            <img alt="" src={XOApp.shared.avatarUser(message.content.reply.fromUID)} style={{ width: "12px", height: "12px",borderRadius:"50%" }} />
                        </div>
                        <div className="xo-message-text-reply-authorname">
                            {message.content.reply.fromName} 
                        </div>
                    </div>
                    <div className="xo-message-text-reply-content">
                        {message.content.reply.content?.conversationDigest}
                    </div>
                </div> : undefined
            }

            <p  className="xo-message-text-content">
                {this.getRenderMessageText()}
                <MessageTrail message={message} />
            </p>
        </MessageBase>
    }
}