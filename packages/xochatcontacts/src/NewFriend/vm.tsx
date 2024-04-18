import { XOSDK, Message, CMDContent } from "xochat_js_sdk";
import { FriendApplyState, XOApp, ProviderListener } from "@xochat/base";
import { FriendApply } from "@xochat/base";

export class NewFriendVM extends ProviderListener {
  friendApplys: FriendApply[] = [];
  sureLoading: boolean = false;
  currentFriendApply?: FriendApply;

  async didMount(): Promise<void> {
    XOApp.shared.friendApplyMarkAllReaded();

    this.friendApplys = await this.getFriendApply();
    if (this.friendApplys.length === 0) {
      this.clearFriendApply();
    }
    this.notifyListener();
    // 监听好友申请
    XOSDK.shared().chatManager.addCMDListener(this.friendRequestCMDListener);
  }

  didUnMount(): void {
    // 监听好友申请
    XOSDK.shared().chatManager.removeCMDListener(this.friendRequestCMDListener);
  }

  friendSure(apply: FriendApply) {
    this.sureLoading = true;
    this.currentFriendApply = apply;
    this.notifyListener();

    XOApp.dataSource.commonDataSource
      .friendSure(apply.token || "")
      .then(() => {
        apply.status = FriendApplyState.accepted;
        XOApp.shared.updateFriendApply(apply);
        this.sureLoading = false;
        this.notifyListener();
      })
      .catch(() => {
        this.sureLoading = false;
        this.notifyListener();
      });
  }

  async getFriendApply(): Promise<FriendApply[]> {
    const fromData = {
      page_index: 1,
      page_size: 999,
    };
    const res = await XOApp.apiClient.get("/friend/apply", {
      param: fromData,
    });

    return res;
  }

  async delFriendApply(apply: FriendApply): Promise<void> {
    XOApp.apiClient
      .delete(`/friend/apply/${apply.to_uid}`)
      .then(async () => {
        this.friendApplys = await this.getFriendApply();
        this.sureLoading = false;
        this.notifyListener();
      })
      .catch(() => {
        this.sureLoading = false;
        this.notifyListener();
      });
  }

  async clearFriendApply(): Promise<void> {
    await XOApp.apiClient.delete(`/user/reddot/friendApply`);
  }

  public async friendRequestCMDListener(message: Message) {
    console.log("收到CMD->", message);
    const cmdContent = message.content as CMDContent;
    if (cmdContent.cmd === "friendRequest") {
      this.friendApplys = await this.getFriendApply();
    }
  }
}
