import React from "react";
import { Component } from "react";
import {
  Contacts,
  ContactsChangeListener,
  ContextMenus,
  ContextMenusContext,
  XOApp,
  WKBase,
  WKBaseContext,
  WKNavMainHeader,
  Search,
  UserRelation,
} from "@xochat/base";
import "./index.scss";
import { toSimplized } from "@xochat/base";
import { getPinyin } from "@xochat/base";
import classnames from "classnames";
import { Toast } from "@douyinfe/semi-ui";
import { Channel, ChannelTypePerson, XOSDK } from "xochat_js_sdk";
import { ContactsListManager } from "../Service/ContactsListManager";
import { Card } from "@xochat/base/src/Messages/Card";

export class ContactsState {
  indexList: string[] = [];
  indexItemMap: Map<string, Contacts[]> = new Map();
  keyword?: string;
  selectedItem?: Contacts; // 被选中的联系人
}

export default class ContactsList extends Component<any, ContactsState> {
  contactsChangeListener!: ContactsChangeListener;
  contextMenusContext!: ContextMenusContext;
  baseContext!: WKBaseContext;
  constructor(props: any) {
    super(props);

    this.state = {
      indexList: [],
      indexItemMap: new Map(),
    };
  }
  componentDidMount() {
    this.contactsChangeListener = () => {
      this.rebuildIndex();
    };

    XOApp.dataSource.addContactsChangeListener(this.contactsChangeListener);

    this.rebuildIndex();

    ContactsListManager.shared.setRefreshList = () => {
      this.setState({});
    };
  }

  componentWillUnmount() {
    ContactsListManager.shared.setRefreshList = undefined;
    XOApp.dataSource.removeContactsChangeListener(this.contactsChangeListener);
  }

  rebuildIndex() {
    console.log("rebuildIndex---->");
    this.buildIndex(this.contactsList());
  }

  contactsList() {
    const { keyword } = this.state;
    return XOApp.dataSource.contactsList.filter((v) => {
      if (v.status === UserRelation.blacklist) {
        return false;
      }
      if (v.follow !== 1) {
        return false;
      }
      if (!keyword || keyword === "") {
        return true;
      }

      if (v.remark && v.remark !== "") {
        if (v.remark.indexOf(keyword) !== -1) {
          return true;
        }
      }

      return v.name.indexOf(keyword) !== -1;
    });
  }

  buildIndex(contacts: Contacts[]) {
    const indexItemMap = new Map<string, Contacts[]>();
    let indexList = [];
    for (const item of contacts) {
      let name = item.name;
      if (item.remark && item.remark !== "") {
        name = item.remark;
      }

      let pinyinNick = getPinyin(toSimplized(name)).toUpperCase();
      let indexName =
        !pinyinNick || /[^a-z]/i.test(pinyinNick[0]) ? "#" : pinyinNick[0];

      let existItems = indexItemMap.get(indexName);
      if (!existItems) {
        existItems = [];
        indexList.push(indexName);
      }
      existItems.push(item);
      indexItemMap.set(indexName, existItems);
    }
    indexList = indexList.sort((a, b) => {
      if (a === "#") {
        return -1;
      }
      if (b === "#") {
        return 1;
      }
      return a.localeCompare(b);
    });
    this.setState({
      indexList: indexList,
      indexItemMap: indexItemMap,
    });
  }

  _handleContextMenu(item: Contacts, event: React.MouseEvent) {
    this.contextMenusContext.show(event);
    this.setState({
      selectedItem: item,
    });
  }

  sectionUI(indexName: string) {
    const { indexItemMap } = this.state;
    const { canSelect } = this.props;
    const items = indexItemMap.get(indexName);

    return (
      <div key={indexName} className="xo-contacts-section">
        <div className="xo-contacts-section-list">
          {items?.map((item, i) => {
            let name = item.name;
            if (item.remark && item.remark !== "") {
              name = item.remark;
            }
            return (
              <div
                key={item.uid}
                className={classnames("xo-contacts-section-item")}
                onClick={() => {
                  const channel = new Channel(item.uid, ChannelTypePerson);
                  XOApp.endpoints.showConversation(channel);
                  this.setState({});
                }}
                onContextMenu={(e) => {
                  this._handleContextMenu(item, e);
                }}
              >
                {i === 0 ? (
                  <div className="xo-contacts-section-item-index">
                    {i === 0 ? indexName : ""}
                  </div>
                ) : (
                  ""
                )}

                <div
                  className={classnames(
                    "xo-contacts-section-item-content",
                    XOApp.shared.openChannel?.channelType ===
                      ChannelTypePerson &&
                      XOApp.shared.openChannel?.channelID === item.uid
                      ? "xo-contacts-section-item-selected"
                      : undefined
                  )}
                >
                  <div className="xo-contacts-section-item-avatar">
                    <img src={item.avatar}></img>
                  </div>
                  <div className="xo-contacts-section-item-name">{name}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  render() {
    const { indexList } = this.state;
    return (
      <WKBase
        onContext={(baseCtx) => {
          this.baseContext = baseCtx;
        }}
      >
        <div className="xo-contacts">
          <WKNavMainHeader title="联系人"></WKNavMainHeader>
          <div className="xo-contacts-content">
            <div className="xo-contacts-content-header">
              <Search
                placeholder="搜索"
                onChange={(v) => {
                  this.setState(
                    {
                      keyword: v,
                    },
                    () => {
                      this.rebuildIndex();
                    }
                  );
                }}
              ></Search>
            </div>
            <div className="xo-contacts-content-fnc">
              {XOApp.endpoints.contactsHeaders().map((view, i) => {
                return <div key={i}>{view}</div>;
              })}
            </div>
            <div className="xo-contacts-content-contacts">
              {indexList.map((indexName) => {
                return this.sectionUI(indexName);
              })}
            </div>
          </div>
          <ContextMenus
            onContext={(context: ContextMenusContext) => {
              this.contextMenusContext = context;
            }}
            menus={[
              {
                title: "查看资料",
                onClick: () => {
                  const { selectedItem } = this.state;
                  this.baseContext.showUserInfo(selectedItem?.uid || "");
                },
              },
              {
                title: "分享给朋友...",
                onClick: () => {
                  XOApp.shared.baseContext.showConversationSelect(
                    (channels: Channel[]) => {
                      const { selectedItem } = this.state;
                      if (channels && channels.length > 0) {
                        for (const channel of channels) {
                          const card = new Card();
                          card.uid = selectedItem?.uid || "";
                          card.name = selectedItem?.name || "";
                          card.vercode = selectedItem?.vercode || "";
                          XOSDK.shared().chatManager.send(card, channel);
                        }
                        Toast.success("分享成功！");
                      }
                    },
                    "分享名片"
                  );
                },
              },
            ]}
          />
        </div>
      </WKBase>
    );
  }
}
