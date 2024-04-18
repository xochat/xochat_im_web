import { Button } from "@douyinfe/semi-ui"
import React from "react"
import { Component, ReactNode } from "react"
import XOApp,{ThemeMode} from "../../App"
import { FinishButtonContext } from "../../Service/Context"

import "./index.css"

export interface WKViewQueueHeaderProps {
    title:string
    onBack?:()=>void
    hideBack?:boolean // 是否隐藏返回按钮
    showFinishButton?:boolean // 是否显示完成按钮
    onFinished?:()=>void;
    onFinishButtonContext?:(context:FinishButtonContext)=>void
    action?: JSX.Element
}

export interface WKViewQueueHeaderState {
    loading?:boolean
    disable?:boolean
}

export default class WKViewQueueHeader extends Component<WKViewQueueHeaderProps,WKViewQueueHeaderState> implements FinishButtonContext {
    constructor(props:any) {
        super(props)
        this.state = {
            loading: false,
            disable: false,
        }
    }
    loading(loading: boolean): void {
       this.setState({
           loading: loading,
       })
    }
    disable(disable: boolean): void {
       this.setState({
           disable: disable,
       })
    }

    componentDidMount() {
        const { onFinishButtonContext } = this.props
        if(onFinishButtonContext) {
            onFinishButtonContext(this)
        }
    }

    render(): ReactNode {
       const  isDark = XOApp.config.themeMode === ThemeMode.dark
        const { title,onBack,hideBack,showFinishButton,onFinished,action } = this.props
        const { loading,disable } = this.state
        return <div className="xo-viewqueueheader">
           {
               hideBack?undefined: <div className="xo-viewqueueheader-back" onClick={()=>{
                if(onBack) {
                    onBack()
                }
            }}>
                <img src={require(`${isDark?"./assets/nav_back_dark.png":"./assets/nav_back.png"}`)}></img>
            </div>
           }
            <div className="xo-viewqueueheader-content">
                    <div className="xo-viewqueueheader-content-title">
                            {title}
                    </div>
                    {
                        showFinishButton?<div className="xo-viewqueueheader-content-action">
                        <Button type="primary" theme='solid' loading={loading} disabled={disable} onClick={()=>{
                            if(onFinished) {
                                onFinished()
                            }
                        }}>
                            完成
                        </Button>
                    </div>:undefined
                    }
                    {
                        action
                    }
            </div>
        </div>
    }
}