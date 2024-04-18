import { EndpointCommon } from "./EndpointCommon";
import APIClient from "./Service/APIClient";
import MenusManager from "./Service/Menus";
import { EndpointManager, IModule, ModuleManager } from "./Service/Module";
import { ProviderListener } from "./Service/Provider";
import RouteManager, { ContextRouteManager } from "./Service/Route";
import { Channel, ChannelTypeGroup, ChannelTypePerson, XOSDK, Message, MessageContentType } from "xochat_js_sdk";
import { IConversationProvider } from "./Service/DataSource/DataProvider";
import MessageManager from "./Service/MessageManager";
import { DefaultEmojiService, EmojiService } from "./Service/EmojiService";
import SectionManager, { Row, Section } from "./Service/Section";
import { EndpointCategory } from "./Service/Const";
import { DataSource } from "./Service/DataSource/DataSource";
import { ConnectAddrCallback } from "xochat_js_sdk";

import 'animate.css';
import "./App.css"
import RouteContext from "./Service/Context";
import { ConnectStatus } from "xochat_js_sdk";
import { WKBaseContext } from "./Components/WKBase";
import StorageService from "./Service/StorageService";

export enum ThemeMode {
    light,
    dark
}
export class WKConfig {
    appName: string = "XOCHAT"
    appVersion: string = "0.0.0" // app版本
    themeColor: string = "#E46342" // 主题颜色
    secondColor: string = "rgba(232, 234, 237)"
    pageSize: number = 15 // 数据页大小
    pageSizeOfMessage: number = 30 // 每次请求消息数量
    fileHelperUID: string = "fileHelper" // 文件助手UID
    systemUID: string = "u_10000" // 系统uid

    private _themeMode: ThemeMode = ThemeMode.light // 主题模式

    set themeMode(v: ThemeMode) {
        this._themeMode = v
        const body = document.body;
        if (v === ThemeMode.dark) {
            if (body.hasAttribute('theme-mode')) {
                body.removeAttribute('theme-mode');
                body.setAttribute('theme-mode', 'dark');
            } else {
                body.setAttribute('theme-mode', 'dark');
            }
        } else {
            body.removeAttribute('theme-mode');
        }
        StorageService.shared.setItem("theme-mode", `${v}`)
        XOApp.shared.notifyListener()
    }

    get themeMode() {
        return this._themeMode
    }

}

export class WKRemoteConfig {
    revokeSecond: number = 2 * 60 // 撤回时间
    requestSuccess: boolean = false

    async startRequestConfig() {
        await this.requestConfig()

        if (!this.requestSuccess) {
            setTimeout(() => {
                this.startRequestConfig()
            }, 3000);
        }
    }

    requestConfig() {
        return XOApp.apiClient.get("common/appconfig").then((result) => {
            this.requestSuccess = true
            this.revokeSecond = result["revoke_second"]
        })
    }
}

export type MessageDeleteListener = (message: Message, preMessage?: Message) => void;

export class LoginInfo {
    appID!: string
    shortNo!: string // 短号
    token?: string
    uid?: string
    name: string | undefined
    role!: string
    isWork!: boolean
    sex!: number

    /**
     * save 保存登录信息
     */
    public save() {

        this.setStorageItemForSID("app_id", this.appID ?? "")
        this.setStorageItemForSID("short_no", this.shortNo ?? "")
        this.setStorageItemForSID("uid", this.uid ?? "");
        this.setStorageItemForSID("token", this.token ?? "");
        this.setStorageItemForSID("name", this.name ?? "");
        this.setStorageItemForSID("role", this.role ?? "")
        this.setStorageItemForSID("is_work", this.isWork ? "1" : "0")
        this.setStorageItemForSID("sex", this.sex == 1 ? "1" : "0")
    }

    // 获取查询参数
    public getQueryVariable(variable: string) {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            if (pair[0] === variable) { return pair[1]; }
        }
        return (false);
    }

    public setStorageItemForSID(key: string, value: string) {
        let sid = this.getSID()

        this.setStorageItem(key + sid, value)
    }

    public getStorageItemForSID(key: string): string | null {
        let sid = this.getSID()
        return this.getStorageItem(key + sid)
    }

    public removeStorageItemForSID(key: string) {
        let sid = this.getSID()
        this.removeStorageItem(key + sid)
    }

    public getSID(): string {
        let sid = this.getQueryVariable("sid") || "";
        return sid
    }

    public setStorageItem(key: string, value: string) {
        StorageService.shared.setItem(key, value)
    }
    public getStorageItem(key: string): string | null {
        return StorageService.shared.getItem(key)
    }
    public removeStorageItem(key: string) {
        StorageService.shared.removeItem(key)
    }


    /**
     * load 加载登录信息
     */
    public load() {
        this.uid = this.getStorageItemForSID('uid') || '';
        this.shortNo = this.getStorageItemForSID('short_no') || '';
        this.token = this.getStorageItemForSID('token') || '';
        this.name = this.getStorageItemForSID("name") || "";
        this.appID = this.getStorageItemForSID("app_id") || '';
        this.role = this.getStorageItemForSID("role") || ''
        const isWorkStr = this.getStorageItemForSID("is_work")
        if (isWorkStr === "1") {
            this.isWork = true
        } else {
            this.isWork = false
        }

        const sexStr = this.getStorageItemForSID("sex")
        if (sexStr === "1") {
            this.sex = 1
        } else {
            this.sex = 0
        }
    }
    // 是否登录
    isLogined() {
        if (!this.token || this.token === '') {
            return false
        }
        return true
    }
    logout() {
        this.token = undefined;
        this.appID = "";
        this.role = ""
        this.removeStorageItem('token');
        this.removeStorageItem('app_id')
        this.removeStorageItem('role')
        this.removeStorageItem('is_work')
    }
}


export default class XOApp extends ProviderListener {
    private constructor() {
        super()
    }
    public static shared = new XOApp()
    static route = RouteManager.shared // 路由管理
    static routeLeft = new ContextRouteManager() // 左边页面路由
    static routeRight = new ContextRouteManager() // 右边（main）页面路由
    static menus = MenusManager.shared // 菜单
    static apiClient = APIClient.shared // api客户端
    static config: WKConfig = new WKConfig() // app配置
    static remoteConfig: WKRemoteConfig = new WKRemoteConfig() // 远程配置
    static loginInfo: LoginInfo = new LoginInfo() // 登录信息
    static endpoints: EndpointCommon = new EndpointCommon() // 常用端点
    static conversationProvider: IConversationProvider // 最近会话相关数据源
    static messageManager: MessageManager = new MessageManager() // 消息管理
    static emojiService: EmojiService = DefaultEmojiService.shared // emoji
    static sectionManager: SectionManager = new SectionManager() // section管理
    static dataSource: DataSource = new DataSource() // 数据源
    static endpointManager: EndpointManager = EndpointManager.shared // 端点管理
    private messageDeleteListeners: MessageDeleteListener[] = new Array<MessageDeleteListener>(); // 消息删除监听

    supportFavorites = [MessageContentType.text, MessageContentType.image] // 注册收藏的消息

    notSupportForward: number[] = [] // 不支持转发的消息

    openChannel?: Channel // 当前打开的会话频道
    content?: JSX.Element

    baseContext!: WKBaseContext // 唐僧叨叨基础上下文


    private _notificationIsClose: boolean = false // 通知是否关闭

    private wsaddrs = new Array<string>() // ws的连接地址
    private addrUsed = false // 地址是否被使用

    set notificationIsClose(v: boolean) {
        this._notificationIsClose = v
        StorageService.shared.setItem("NotificationIsClose", v ? "1" : "")
    }

    get notificationIsClose() {
        return this._notificationIsClose
    }


    // app启动
    startup() {
        XOApp.loginInfo.load() // 加载登录信息

        const themeMode = StorageService.shared.getItem("theme-mode")
        if (themeMode === "1") {
            XOApp.config.themeMode = ThemeMode.dark
        }

        XOSDK.shared().config.provider.connectAddrCallback = async (callback: ConnectAddrCallback) => {
            if (!this.wsaddrs || this.wsaddrs.length == 0) {
                this.wsaddrs = await XOApp.dataSource.commonDataSource.imConnectAddrs()
            }
            if (this.wsaddrs.length > 0) {
                console.log("connectAddrs--->", this.wsaddrs)
                this.addrUsed = true
                callback(this.wsaddrs[0])
            }

        }

        XOApp.endpoints.addOnLogin(() => {
            this.startMain()
        })

        if (XOApp.loginInfo.isLogined()) {
            this.startMain()
        }

        XOSDK.shared().connectManager.addConnectStatusListener((status: ConnectStatus, reasonCode?: number) => {
            if (status === ConnectStatus.ConnectKick) {
                console.log("被踢--->", reasonCode)
                XOApp.shared.logout()
            } else if (reasonCode == 2) { // 认证失败！
                XOApp.shared.logout()
            } else if (status === ConnectStatus.Disconnect) {
                if (this.addrUsed && this.wsaddrs.length > 1) {
                    const oldwsAddr = this.wsaddrs[0]
                    this.wsaddrs.splice(0, 1)
                    this.wsaddrs.push(oldwsAddr)
                    this.addrUsed = false
                    console.log("连接失败！切换地址->", this.wsaddrs)
                }


            }
        })

        // 通知设置
        const notificationIsClose = StorageService.shared.getItem("NotificationIsClose")
        if (notificationIsClose === "1") {
            this._notificationIsClose = true
        } else {
            this._notificationIsClose = false
        }

        XOApp.remoteConfig.startRequestConfig()

    }

    startMain() {
        this.connectIM()
        XOApp.dataSource.contactsSync()
    }

    connectIM() {
        XOSDK.shared().config.uid = XOApp.loginInfo.uid
        XOSDK.shared().config.token = XOApp.loginInfo.token
        XOSDK.shared().connect()
    }

    registerModule(module: IModule) {
        ModuleManager.shared.register(module);
    }

    restContent(content: JSX.Element) {
        this.content = content
        this.notifyListener()
    }



    // 是否登录
    isLogined() {
        return XOApp.loginInfo.isLogined()
    }
    // 登出
    logout() {
        XOApp.loginInfo.logout()
        window.location.reload()
    }

    avatarChannel(channel: Channel) {
        if (!channel) {
            return ""
        }
        let avatarTag = this.getChannelAvatarTag()
        if (!avatarTag) {
            avatarTag = "0"
        }
        const channelInfo = XOSDK.shared().channelManager.getChannelInfo(channel)
        if (channelInfo && channelInfo.logo && channelInfo.logo !== "") {
            let logo = channelInfo.logo;
            if (logo.indexOf("?") != -1) {
                logo += "&v=" + avatarTag
            } else {
                logo += "?v=" + avatarTag
            }
            return XOApp.dataSource.commonDataSource.getImageURL(logo)
        }
        const baseURl = XOApp.apiClient.config.apiURL
        if (channel.channelType === ChannelTypePerson) {
            return `${baseURl}users/${channel.channelID}/avatar?v=${avatarTag}`
        } else if (channel.channelType == ChannelTypeGroup) {
            return `${baseURl}groups/${channel.channelID}/avatar?v=${avatarTag}`
        }
        return ""
    }

    avatarUser(uid: string) {
        const c = new Channel(uid, ChannelTypePerson)
        return this.avatarChannel(c)
    }

    // 我的用户头像发送改变
    myUserAvatarChange() {
        this.changeChannelAvatarTag()
    }

    changeChannelAvatarTag() {
        let myAvatarTag = "channelAvatarTag"
        XOApp.loginInfo.setStorageItem(myAvatarTag, new Date().getTime() + "")
    }
    getChannelAvatarTag() {
        let myAvatarTag = "channelAvatarTag"
        const tag = XOApp.loginInfo.getStorageItem(myAvatarTag)
        if (!tag) {
            return ""
        }
        return tag
    }

    avatarGroup(groupNo: string) {
        const channel = new Channel(groupNo, ChannelTypeGroup)
        return this.avatarChannel(channel)
    }

    // 注册频道设置
    channelSettingRegister(sectionID: string, sectionFnc: (context: RouteContext<any>) => Section | undefined, sort?: number) {
        XOApp.sectionManager.register(EndpointCategory.channelSetting, sectionID, sectionFnc, sort)
    }

    // 获取频道设置
    channelSettings(context: RouteContext<any>): Section[] {
        return XOApp.sectionManager.sections(EndpointCategory.channelSetting, context)
    }

    // 注册管理设置
    channelManageRegister(sectionID: string, sectionFnc: (context: RouteContext<any>) => Section | undefined) {
        XOApp.sectionManager.register(EndpointCategory.channelManage, sectionID, sectionFnc)
    }

    // 获取频道管理
    channelManages(context: RouteContext<any>): Section[] {
        return XOApp.sectionManager.sections(EndpointCategory.channelManage, context)
    }

    chatMenusRegister(sid: string, f: (param: any) => ChatMenus, sort?: number) {
        XOApp.endpointManager.setMethod(sid, (param) => {
            return f(param)
        }, {
            category: EndpointCategory.chatMenusPopover,
            sort: sort,
        })
    }
    chatMenus(param?: any): ChatMenus[] {
        return XOApp.endpointManager.invokes<ChatMenus>(EndpointCategory.chatMenusPopover, param)
    }

    sectionAddRow(sectionID: string, row: Row, context: RouteContext<any>) {
        const section = XOApp.sectionManager.section(sectionID, context)
        if (section) {
            if (!section.rows) {
                section.rows = []
            }
            section.rows.push(row)
        }
    }

    // 注册用户信息
    userInfoRegister(sectionID: string, sectionFnc: (context: RouteContext<any>) => Section | undefined, sort?: number) {
        XOApp.sectionManager.register(EndpointCategory.userInfo, sectionID, sectionFnc)
    }

    // 获取用户信息
    userInfos(context: RouteContext<any>): Section[] {
        return XOApp.sectionManager.sections(EndpointCategory.userInfo, context)
    }

    private getFriendApplysKey() {
        return `${XOApp.loginInfo.uid}friendApplys`
    }


    public getFriendApplys(): Array<FriendApply> {
        var friendApplys = new Array<FriendApply>()
        const value = XOApp.loginInfo.getStorageItem(this.getFriendApplysKey())
        if (!value || value === "") {
            return friendApplys
        }
        const friendApplyObjs = JSON.parse(value)

        if (friendApplyObjs && friendApplyObjs.length > 0) {
            for (const friendApplyObj of friendApplyObjs) {
                const f = new FriendApply()
                f.uid = friendApplyObj.uid
                f.to_name = friendApplyObj.to_name
                f.remark = friendApplyObj.remark
                f.status = friendApplyObj.status
                f.token = friendApplyObj.token
                f.unread = friendApplyObj.unread
                f.createdAt = friendApplyObj.createdAt
                friendApplys.push(f)
            }
        }
        friendApplys.sort((a, b) => {
            return b.createdAt - a.createdAt
        })
        return friendApplys
    }

    public async getFriendApplysUnreadCount() {
        // const friendApplys = this.getFriendApplys()
        let unreadCount = 0
        // if (friendApplys && friendApplys.length > 0) {
        //     for (const friendApply of friendApplys) {
        //         if (friendApply.unread) {
        //             unreadCount++
        //         }
        //     }
        // }
        if (!XOApp.loginInfo.isLogined()) {
            return unreadCount;
          }
          const res = await XOApp.apiClient.get(`/user/reddot/friendApply`);
        unreadCount = res.count;
        return unreadCount
    }

    public async friendApplyMarkAllReaded(): Promise<void> {
        // let friendApplys = this.getFriendApplys()
        // if (!friendApplys) {
        //     friendApplys = new Array<FriendApply>()
        // }
        // var change = false
        // for (const friendApply of friendApplys) {
        //     if (friendApply.unread) {
        //         friendApply.unread = false
        //         change = true
        //     }
        // }
        // if (change) {
        //     XOApp.loginInfo.setStorageItem(this.getFriendApplysKey(), JSON.stringify(friendApplys))
        //     XOApp.endpointManager.invokes(EndpointCategory.friendApplyDataChange)
        // }
        await XOApp.apiClient.delete(`/user/reddot/friendApply`);
    }

    public addFriendApply(friendApply: FriendApply) {
        let friendApplys = this.getFriendApplys()
        if (!friendApplys) {
            friendApplys = new Array<FriendApply>()
        }

        var exist = false
        for (let index = 0; index < friendApplys.length; index++) {
            const friendAy = friendApplys[index];
            if (friendAy.uid === friendApply.uid) {
                friendApplys[index] = friendApply
                exist = true
                break
            }
        }
        if (!exist) {
            friendApplys.push(friendApply)
        }
        XOApp.loginInfo.setStorageItem(this.getFriendApplysKey(), JSON.stringify(friendApplys))
        XOApp.endpointManager.invokes(EndpointCategory.friendApplyDataChange)
    }

    public updateFriendApply(friendApply: FriendApply) {
        let friendApplys = this.getFriendApplys()
        if (!friendApplys) {
            friendApplys = new Array<FriendApply>()
        }
        var exist = false
        for (let index = 0; index < friendApplys.length; index++) {
            const friendAy = friendApplys[index];
            if (friendAy.uid === friendApply.uid) {
                friendApplys[index] = friendApply
                exist = true
                break
            }
        }
        if (exist) {
            XOApp.loginInfo.setStorageItem(this.getFriendApplysKey(), JSON.stringify(friendApplys))
        }
    }

    public addMessageDeleteListener(listener: MessageDeleteListener) {
        this.messageDeleteListeners.push(listener)
    }
    public removeMessageDeleteListener(listener: MessageDeleteListener) {
        const len = this.messageDeleteListeners.length;
        for (let i = 0; i < len; i++) {
            if (listener === this.messageDeleteListeners[i]) {
                this.messageDeleteListeners.splice(i, 1)
                return;
            }
        }
    }
    public notifyMessageDeleteListener(message: Message, preMessage?: Message) {
        const len = this.messageDeleteListeners.length;
        for (let i = 0; i < len; i++) {
            this.messageDeleteListeners[i](message, preMessage)
        }
    }

}


export enum FriendApplyState {
    apply,
    accepted
}
// 好友申请
export class FriendApply {
    uid!: string;
    to_uid!: string;
    to_name!: string;
    remark?: string;
    token?: string;
    status!: FriendApplyState;
    unread: boolean = false; // 是否未读
    createdAt!: number; // 创建时间
}


export class ChatMenus {
    icon!: string
    title!: string
    sort?: number = 0
    onClick?: () => void
}