import classNames from "classnames";
import React from "react";
import { Component, ReactNode } from "react";
import { EndpointID } from "../../Service/Const";
import XOApp from "../../App";
import { Emoji, EmojiService } from "../../Service/EmojiService";
import ConversationContext from "../Conversation/context";

import "./index.css"
import { LottieSticker } from "../../Messages/LottieSticker";

interface EmojiToolbarProps {
    conversationContext: ConversationContext
    icon: string
}

interface EmojiToolbarState {
    show: boolean
    animationStart: boolean
}

export default class EmojiToolbar extends Component<EmojiToolbarProps, EmojiToolbarState>{

    constructor(props: any) {
        super(props)
        this.state = {
            show: false,
            animationStart: false,
        }
    }

    render(): ReactNode {
        const { show, animationStart } = this.state
        const { icon, conversationContext } = this.props
        return <div className="xo-emojitoolbar" >
            <div className="xo-emojitoolbar-content" onClick={() => {
                this.setState({
                    show: !show,
                    animationStart: true
                })
            }}>
                <img src={icon}></img>
                <div onAnimationEnd={() => {
                    // this.setState({
                    //     animationStart: false
                    // })
                    if (!show) {
                        this.setState({
                            animationStart: false,
                        })
                    }
                }} className={classNames("xo-emojitoolbar-emojipanel", animationStart ? (show ? "xo-emojitoolbar-emojipanel-show" : "xo-emojitoolbar-emojipanel-hide") : undefined)}>
                    <EmojiPanel onSticker={(sticker) => {
                        this.setState({
                            show: false
                        })
                        const lottieSticker = new LottieSticker()
                        lottieSticker.category = sticker.category
                        lottieSticker.url = sticker.path
                        lottieSticker.placeholder = sticker.placeholder
                        lottieSticker.format = sticker.format
                        conversationContext.sendMessage(lottieSticker)
                    }} onEmoji={(emoji) => {
                        this.setState({
                            show: false
                        })
                        conversationContext.messageInputContext().insertText(emoji.key)
                    }}></EmojiPanel>
                </div>
            </div>
            {
                show ? <div className="xo-emojitoolbar-mask" onClick={()=>{
                    this.setState({
                        show: false,
                    })
                }}>
                </div> : undefined
            }

        </div>
    }
}

interface EmojiPanelState {
    emojis: Emoji[]
    category: string
    stickers: any[]
}

interface EmojiPanelProps {
    onEmoji?: (emoji: Emoji) => void
    onSticker?: (sticker: any) => void
}

var stickerCategories = new Array<any>()
export class EmojiPanel extends Component<EmojiPanelProps, EmojiPanelState> {
    emojiService: EmojiService

    constructor(props: any) {
        super(props)
        this.emojiService = XOApp.endpointManager.invoke(EndpointID.emojiService)
        this.state = {
            emojis: [],
            category: "emoji",
            stickers: []
        }
    }

    componentDidMount() {
        this.setState({
            emojis: this.emojiService.getAllEmoji()
        })
        // 获取表情
        // this.requestStickerCategory()
    }

    requestStickerCategory() {
        if (!stickerCategories || stickerCategories.length === 0) {
            console.log('====',stickerCategories)
            XOApp.dataSource.commonDataSource.userStickerCategory().then((result) => {
                stickerCategories = result
                this.setState({})
            })
        }
    }
    requestStickers(category: string) {
        XOApp.dataSource.commonDataSource.getStickers(category).then((result) => {
            this.setState({
                stickers: result.list,
            })
        })
    }

    render(): React.ReactNode {
        const { emojis, category, stickers } = this.state
        const { onEmoji, onSticker } = this.props
        return <div className="xo-emojipanel">
            <div className={classNames("xo-emojipanel-content", category !== "emoji" ? "xo-emojipanel-content-sticker" : undefined)}>
                <ul>
                    {
                        category === "emoji" ? emojis.map((emoji, i) => {
                            return <li key={i} onClick={(e) => {
                                e.stopPropagation()
                                if (onEmoji) {
                                    onEmoji(emoji)
                                }
                            }}>
                                {/* <img src={require(`./emoji/${emoji.image}`)}> </img> */}
                                <img src={emoji.image}></img>
                            </li>
                        }) : undefined
                    }
                    {
                        stickers && stickers.length > 0 && category !== "emoji" ? stickers.map((sticker) => {
                            return <li key={sticker.path} onClick={(e) => {
                                e.stopPropagation()
                                if (onSticker) {
                                    onSticker(sticker)
                                }
                            }}>
                                {/* <img src={require(`./emoji/${emoji.image}`)}> </img> */}
                                <tgs-player style={{ width: "74px", height: "74px" }} autoplay mode="normal" src={XOApp.dataSource.commonDataSource.getFileURL(sticker.path)}></tgs-player>
                            </li>
                        }) : undefined
                    }
                </ul>
            </div>
            <div className="xo-emojipanel-tab">
                <div className={classNames("xo-emojipanel-tab-item", category === "emoji" ? "xo-emojipanel-tab-item-selected" : undefined)} onClick={(e) => {
                    e.stopPropagation()
                    this.setState({ category: "emoji" })
                }}>
                    <img alt="" src={require("./emoji_tab_icon.png")}></img>
                </div>
                {
                    stickerCategories.map((stickerCategory) => {
                        return (
                            <div key={stickerCategory.category} className={classNames("xo-emojipanel-tab-item", stickerCategory.category === category ? "xo-emojipanel-tab-item-selected" : undefined)} onClick={(e) => {
                                e.stopPropagation()
                                const category: string = stickerCategory.category || ""
                                this.setState({ category: category })
                                this.requestStickers(category)

                            }}>
                                <img alt="" src={XOApp.dataSource.commonDataSource.getFileURL(stickerCategory.cover)}></img>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    }
}