import { XOApp, ProviderListener } from "@xochat/base";
import { ChannelInfo,XOSDK } from "xochat_js_sdk";
import { ChannelInfoListener } from "xochat_js_sdk";
export class GroupSaveVM extends ProviderListener {
    groups:ChannelInfo[] = []
    channelInfoListener!:ChannelInfoListener


    didMount(): void {
       this.request()

       this.channelInfoListener = (channelInfo:ChannelInfo) => {
          if(this.groups.length > 0) {
            for (const group of this.groups) {
                if(group.channel.isEqual(channelInfo.channel)) {
                    this.request()
                    break
                }
            }
          }
       }

       XOSDK.shared().channelManager.addListener(this.channelInfoListener)
    }

    didUnMount(): void {
        XOSDK.shared().channelManager.removeListener(this.channelInfoListener)
    }

   async request() {
       this.groups = await XOApp.dataSource.channelDataSource.groupSaveList()
       this.notifyListener()
    }
}