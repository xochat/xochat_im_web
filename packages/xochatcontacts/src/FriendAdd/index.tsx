import { XOApp, WKViewQueueHeader, QRCodeMy, Search } from "@xochat/base";
import {WKBase, WKBaseContext } from "@xochat/base";
import React from "react";
import { Component, ReactNode } from "react";
import { Spin,Toast } from '@douyinfe/semi-ui';
import "./index.css"

export interface FriendAddProps {
    onBack?: () => void
}

export class FriendAddState {
    spinning!:boolean
    keyword?:string
    result?:any
}

export class FriendAdd extends Component<FriendAddProps,FriendAddState> {
    baseContext!:WKBaseContext
    constructor(props:any) {
        super(props)

        this.state = {
            spinning: false,
        }
    }

    async searchUser() {
        const { keyword } = this.state
        if(!keyword) {
            return
        }

        this.setState({
            spinning: true,
        })
      const result = await XOApp.dataSource.commonDataSource.searchUser(keyword).catch((err)=>{
          Toast.error(err.msg)
      })
      if(result) {
        this.setState({
            result: result,
            spinning: false,
        })
        if(result.exist !== 1) {
            Toast.error("用户不存在！")
        }else {
            XOApp.shared.baseContext.showUserInfo(result.data.uid,undefined,result.data.vercode)
        }
      }
    }   


    render(): ReactNode {
        const { onBack } = this.props
        const { spinning } = this.state
        return <WKBase onContext={(ctx)=>{
            this.baseContext = ctx
        }}>
            <div className="xo-friendadd">
            <WKViewQueueHeader title="添加好友" onBack={onBack} />
            <div className="xo-friendadd-content">
                <Spin spinning={spinning}>
                <Search placeholder={`${XOApp.config.appName}号/手机号`} onChange={(v)=>{
                    this.setState({
                        keyword: v
                    })
                }} onEnterPress={()=>{
                    this.searchUser()
                }}></Search>
                </Spin>
                <div className="xo-friendadd-content-qrcode">
                        我的{XOApp.config.appName}号：{XOApp.loginInfo.shortNo} <img onClick={()=>{
                            XOApp.routeLeft.push(<QRCodeMy></QRCodeMy>)
                        }} src={require("./assets/icon_qrcode.png")}></img>
                </div>  
            </div>
        </div>
        </WKBase>
    }
}