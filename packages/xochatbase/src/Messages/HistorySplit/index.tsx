import { MessageContent } from "xochat_js_sdk";
import React from "react";
import { MessageContentTypeConst } from "../../Service/Const";
import { MessageCell } from "../MessageCell";

import  './index.css'


export class HistorySplitContent extends MessageContent {

    public get contentType() {
        return MessageContentTypeConst.historySplit
    }
}

export class HistorySplitCell extends MessageCell {

    render() {
        return <div className="xo-message-split-box">
           <div className="xo-message-split-line1"></div>
           <div className="xo-message-split-content">以上为历史消息</div>
           <div className="xo-message-split-line2"></div>
        </div>
    }
}