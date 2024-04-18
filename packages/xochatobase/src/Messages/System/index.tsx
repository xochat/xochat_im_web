import { SystemContent } from "xochat_js_sdk"
import React from "react"
import { MessageCell } from "../MessageCell"
import  './index.css'

export class SystemCell  extends MessageCell {

     render()  {
         const {message} = this.props
        const content = message.content as SystemContent
        return <div className="xo-message-system">{content.displayText}</div>
    }
}