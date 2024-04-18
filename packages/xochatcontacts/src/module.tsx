import {
  EndpointCategory,
  IconListItem,
  IModule,
  XOApp,
  ThemeMode,
} from "@xochat/base";
import React from "react";
import Blacklist from "./Blacklist";
import { FriendAdd } from "./FriendAdd";
import GroupSave from "./GroupSave";
import { NewFriend } from "./NewFriend";
import { ContactsListManager } from "./Service/ContactsListManager";

export default class ContactsModule implements IModule {
  id(): string {
    return "ContactsModule";
  }
  init(): void {
    console.log("【ContactsModule】初始化");

    XOApp.endpointManager.setMethod(
      "contacts.friendapply.change",
      () => {
        ContactsListManager.shared.refreshList();
      },
      {
        category: EndpointCategory.friendApplyDataChange,
      }
    );

    // 获取好友未申请添加数量
    let unreadCount = 0;
    if (XOApp.loginInfo.isLogined()) {
      XOApp.apiClient.get(`/user/reddot/friendApply`).then((res) => {
        unreadCount = res.count;
        XOApp.menus.refresh();
      });
    }

    XOApp.endpoints.registerContactsHeader("friends.new", (param: any) => {
      return (
        <IconListItem
          badge={unreadCount}
          title="新朋友"
          icon={require("./assets/friend_new.png")}
          backgroudColor={"var(--xo-color-secondary)"}
          onClick={() => {
            XOApp.routeLeft.push(<NewFriend></NewFriend>);
          }}
        ></IconListItem>
      );
    });

    XOApp.endpoints.registerContactsHeader("groups.save", (param: any) => {
      return (
        <IconListItem
          title="保存的群"
          icon={require("./assets/icon_group_save.png")}
          backgroudColor={"var(--xo-color-secondary)"}
          onClick={() => {
            XOApp.routeLeft.push(<GroupSave></GroupSave>);
          }}
        ></IconListItem>
      );
    });

    XOApp.endpoints.registerContactsHeader(
      "contacts.blacklist",
      (param: any) => {
        return (
          <IconListItem
            title="黑名单"
            icon={require("./assets/blacklist.png")}
            backgroudColor={"var(--xo-color-secondary)"}
            onClick={() => {
              XOApp.routeLeft.push(<Blacklist></Blacklist>);
            }}
          ></IconListItem>
        );
      }
    );

    XOApp.shared.chatMenusRegister("chatmenus.addfriend", (param) => {
      const isDark = XOApp.config.themeMode === ThemeMode.dark;
      return {
        title: "添加朋友",
        icon: require(`${
          isDark
            ? "./assets/popmenus_friendadd_dark.png"
            : "./assets/popmenus_friendadd.png"
        }`),
        onClick: () => {
          XOApp.routeLeft.push(
            <FriendAdd
              onBack={() => {
                XOApp.routeLeft.pop();
              }}
            ></FriendAdd>
          );
        },
      };
    });
  }
}
