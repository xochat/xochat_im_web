import { Channel } from "xochat_js_sdk";
import XOApp from "../../App";
import { ChannelQrcodeResp } from "../../Service/DataSource/DataSource";
import { ProviderListener } from "../../Service/Provider";


export class ChannelQRCodeVM extends ProviderListener {
    channel!:Channel
    qrcodeResp?: ChannelQrcodeResp

    constructor(channel:Channel) {
        super()
        this.channel = channel
    }   

    didMount(): void {
       this.requestQRCode()
    }

    async requestQRCode() {
        this.qrcodeResp = await XOApp.dataSource.channelDataSource.qrcode(this.channel)
        this.notifyListener()
    }
}