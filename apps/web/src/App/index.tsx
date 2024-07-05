import { ChatPage, EndpointCategory, XOApp, Menus } from "@xochat/base";
import { ContactsList } from "@xochat/contacts";
import React from "react";
import "./index.css";
import AppLayout from "../Layout";
import { XOSDK } from "xochat_js_sdk";
function App() {
  registerMenus();
  return <AppLayout />;
}

function registerMenus() {
  XOSDK.shared().conversationManager.addConversationListener(() => {
    XOApp.menus.refresh();
  });

  XOApp.endpointManager.setMethod(
    "menus.friendapply.change",
    () => {
      XOApp.menus.refresh();
    },
    {
      category: EndpointCategory.friendApplyDataChange,
    }
  );

  XOApp.menus.register(
    "chat",
    (context) => {
      const m = new Menus(
        "chat",
        "/",
        "会话",
        <img alt="会话" src={require("./assets/message.png")}></img>,
        (
          <img
            alt="会话"
            src={require("./assets/message-active.png")}
          ></img>
        )
      );
      let badge = 0;
      for (const conversation of XOSDK.shared().conversationManager
        .conversations) {
        if (!conversation.channelInfo?.mute) {
          badge += conversation.unread;
        }
      }
      m.badge = badge;
      return m;
    },
    1000
  );

  // 获取好友未申请添加数量
  let unreadCount = 0;
  if (XOApp.loginInfo.isLogined()) {
    XOApp.apiClient.get(`/user/reddot/friendApply`).then((res) => {
      unreadCount = res.count;
      XOApp.menus.refresh();
    });
  }

  XOApp.menus.register(
    "contacts",
    (param) => {
      const m = new Menus(
        "contacts",
        "/contacts",
        "通讯录",
        (
          <img
            alt="通讯录"
            src={require("./assets/phone.png")}
          ></img>
        ),
        (
          <img
            alt="通讯录"
            src={require("./assets/phone-active.png")}
          ></img>
        )
      );

      m.badge = unreadCount;
      return m;
    },
    2000
  );

  XOApp.route.register("/", () => {
    return <ChatPage></ChatPage>;
  });

  XOApp.route.register("/contacts", () => {
    return <ContactsList></ContactsList>;
  });
}

export default App;
