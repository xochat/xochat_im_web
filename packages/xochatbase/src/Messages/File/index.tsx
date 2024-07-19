import { MessageContent,MediaMessageContent,MessageStatus } from "xochat_js_sdk"
import React from "react"
import XOApp from "../../App"
import MessageBase from "../Base"
import { MessageCell } from "../MessageCell"

import "./index.css"
import { MessageContentTypeConst } from "../../Service/Const"

export class FileContent extends MediaMessageContent {
    title!: string // 标题
    size:any//文件大小
    url!: string
    constructor(file?: File,title?: string, size?: any,extension?:string) {
        super()
        this.file = file
        this.title = title || ''
        this.size = size || 0
        this.extension = extension || ''
        
    }

    decodeJSON(content: any) {
        console.log('decode',content)
        this.title = content["title"] || ""
        this.size = content["size"] || ""
        this.extension = content["extension"] || ""
        this.url = content["url"]
        this.remoteUrl = this.url
    }
    encodeJSON() {
        console.log('encodeJSON',this.url,this.remoteUrl)
        return { "title": this.title || "", "size": this.size || "",extension:this.extension, "url": this.remoteUrl || "" }
    }
    get contentType() {
        return MessageContentTypeConst.file
    }
    get conversationDigest() {

        return "[文件]"
    }
}


export class FileCell extends MessageCell {
    getFileSizeFormat(size: number) {
        if (size < 1024) {
            return `${size} B`
        }
        if (size > 1024 && size < 1024 * 1024) {
            return `${(size / 1024).toFixed(2)} KB`
        }
        if (size > 1024 * 1024 && size < 1024 * 1024 * 1024) {
            return `${(size / 1024 / 1024).toFixed(2)} M`
        }
        return `${(size / (1024 * 1024 * 1024)).toFixed(2)}G`
    }
    render() {
        const { message, context } = this.props
        const content = message.content as FileContent
        return <MessageBase hiddeBubble={true} message={message} context={context}>
            <div className="xo-message-file" onClick={()=>{
                if(message.status != MessageStatus.Normal){
                    return;
                }
                window.open(XOApp.dataSource.commonDataSource.getFileURL(content.url || content.remoteUrl))
            }}>
                <div className="xo-message-file-content">
                    
                    <div className="xo-message-file-content-column">
                    <div className="xo-message-file-content-title">{content.title}</div>
                    <div className="xo-message-file-content-row">
                    <div className="xo-message-file-content-size">{this.getFileSizeFormat(content.size)}</div>
                    <div className="xo-message-file-content-download">下载</div>
                    <img className="xo-message-file-content-file-icon-download"  src={require("../../assets/message_file_icon_download.png")}></img>
                    </div>
                    </div>
                    <img className="xo-message-file-content-file-icon"  src={require("../../assets/message_file_icon.png")}></img>
                    
                </div>
            </div>
            </MessageBase>
    }

}