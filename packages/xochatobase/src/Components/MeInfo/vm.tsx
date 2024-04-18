import React from "react";
import QRCodeMy from "../QRCodeMy";
import XOApp from "../../App";
import RouteContext, { FinishButtonContext, RouteContextConfig } from "../../Service/Context";
import { ProviderListener } from "../../Service/Provider";
import { Row, Section } from "../../Service/Section";
import { InputEdit } from "../InputEdit";
import { ListItem, ListItemIcon } from "../ListItem";
import { Sex, SexSelect } from "../SexSelect";
import { ListItemAvatar } from "../ListItemAvatar";
import axios from "axios";
import { Toast } from "@douyinfe/semi-ui";
import XOSDK from "xochat_js_sdk";
import { ChannelInfoListener } from "xochat_js_sdk";
import { ChannelInfo, ChannelTypePerson } from "xochat_js_sdk";
export class MeInfoVM extends ProviderListener {

    channelInfoListener!:ChannelInfoListener

    didMount(): void {
        this.channelInfoListener = (channelInfo:ChannelInfo)=>{
            if(channelInfo.channel.channelType !== ChannelTypePerson) {
                return
            }
            if(channelInfo.channel.channelID !== XOApp.loginInfo.uid) {
                return
            }
            XOApp.loginInfo.name = channelInfo.title;
            XOApp.loginInfo.shortNo = channelInfo.orgData.short_no;
            XOApp.loginInfo.sex = channelInfo.orgData.sex;
            XOApp.shared.myUserAvatarChange()
            this.notifyListener()
        }
        XOSDK.shared().channelManager.addListener(this.channelInfoListener)
    }

    didUnMount(): void {
        XOSDK.shared().channelManager.removeListener(this.channelInfoListener)
    }

    uploadAvatar(file: File) {
        const param = new FormData();
        param.append("file", file);
        return axios.post(`users/${XOApp.loginInfo.uid}/avatar`, param, {
            headers: { "Content-Type": "multipart/form-data", "token": XOApp.loginInfo.token || "" },
        }).catch(error => {
            console.log('文件上传失败！->', error);
        })
    }

    updateMyInfo(field: string, value: string) {
        let param: any = {}
        param[field] = value
        return XOApp.apiClient.put("user/current", param).catch((err) => {
            Toast.error(err.msg)
        })
    }

    inputEditPush(context: RouteContext<any>, defaultValue: string, onFinish: (value: string) => Promise<void>, placeholder?: string,maxCount?:number) {
        let value: string
        let finishButtonContext: FinishButtonContext
        context.push(<InputEdit maxCount={maxCount} defaultValue={defaultValue} placeholder={placeholder} onChange={(v) => {
            value = v
            if (!value || value === "") {
                finishButtonContext.disable(true)
            } else {
                finishButtonContext.disable(false)
            }
        }}></InputEdit>, new RouteContextConfig({
            showFinishButton: true,
            onFinishContext: (finishBtnContext) => {
                finishButtonContext = finishBtnContext
                finishBtnContext.disable(true)
            },
            onFinish: async () => {
                finishButtonContext.loading(true)
                await onFinish(value)
                finishButtonContext.loading(false)

                context.pop()
            }
        }))
    }

    sections(context: RouteContext<any>) {

        let sections = new Array<Section>()
        sections.push(new Section({
            rows: [
                new Row({
                    cell: ListItemAvatar,
                    properties: {
                        title: `头像`,
                        context: context,
                        avatar: <img style={{ "width": "24px", "height": "24px", "borderRadius": "50%" }} src={XOApp.shared.avatarUser(XOApp.loginInfo.uid || "")}></img>,
                        onFileUpload: async (f: File) => {
                            await this.uploadAvatar(f)
                            XOApp.shared.changeChannelAvatarTag()
                        }
                    }
                }),
                new Row({
                    cell: ListItem,
                    properties: {
                        title: "名字",
                        subTitle: XOApp.loginInfo.name,
                        onClick: () => {
                            this.inputEditPush(context, XOApp.loginInfo.name || "", async (value) => {
                                if (value.trim() == "") {
                                    Toast.error("名字不能为空！")
                                    return
                                }
                                return this.updateMyInfo("name",value).then(()=>{
                                    XOApp.loginInfo.name = value
                                    XOApp.loginInfo.save()
                                })
                            }, "设置名字",20)
                        }
                    }
                }),
                new Row({
                    cell: ListItem,
                    properties: {
                        title: `${XOApp.config.appName}号`,
                        subTitle: XOApp.loginInfo.shortNo,
                        onClick: () => {

                        }
                    }
                }),
                new Row({
                    cell: ListItemIcon,
                    properties: {
                        title: `我的二维码`,
                        icon: <img style={{ "width": "24px", "height": "24px" }} src={require("./../../assets/icon_qrcode.png")}></img>,
                        onClick: () => {
                            context.push(<QRCodeMy disableHeader={true}></QRCodeMy>)
                        }
                    }
                })
            ]
        }))

        let sex = XOApp.loginInfo.sex === 0 ? Sex.Female : Sex.Male
        let sexStr = "男"
        if (sex == Sex.Female) {
            sexStr = "女"
        }

        sections.push(new Section({
            rows: [
                new Row({
                    cell: ListItem,
                    properties: {
                        title: "性别",
                        subTitle: sexStr,
                        onClick: () => {
                            context.push(<SexSelect sex={sex} onSelect={ async (sex) => {
                                this.updateMyInfo("sex",sex.toString())
                                context.pop()
                                XOApp.loginInfo.sex = sex
                                XOApp.loginInfo.save()
                            }}></SexSelect>)
                        }
                    }
                }),
            ]
        }))

        return sections
    }
}