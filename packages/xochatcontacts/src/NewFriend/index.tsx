import {
  FriendApplyState,
  XOApp,
  WKViewQueueHeader,
  Provider,
} from "@xochat/base";
import React from "react";
import { Component, ReactNode } from "react";
import { Button } from "@douyinfe/semi-ui";
import "./index.css";
import { NewFriendVM } from "./vm";
import "./index.css";
import { FriendAdd } from "../FriendAdd";

export class NewFriend extends Component {
  render(): ReactNode {
    return (
      <Provider
        create={() => {
          return new NewFriendVM();
        }}
        render={(vm: NewFriendVM) => {
          return (
            <div className="wk-newfriend">
              <WKViewQueueHeader
                title="新朋友"
                onBack={() => {
                  XOApp.routeLeft.pop();
                }}
                action={
                  <div className="wk-viewqueueheader-content-action">
                    <Button
                      size="small"
                      onClick={() => {
                        XOApp.routeLeft.push(
                          <FriendAdd
                            onBack={() => {
                              XOApp.routeLeft.pop();
                            }}
                          ></FriendAdd>
                        );
                      }}
                    >
                      添加好友
                    </Button>
                  </div>
                }
              ></WKViewQueueHeader>
              <div className="wk-newfriend-content">
                <ul>
                  {vm.friendApplys.map((f) => {
                    return (
                      <li key={f.to_uid}>
                        <div className="wk-newfriend-content-avatar">
                          <img src={XOApp.shared.avatarUser(f.to_uid)}></img>
                        </div>
                        <div className="wk-newfriend-content-title">
                          <div className="wk-newfriend-content-title-name">
                            {f.to_name}
                          </div>
                          <div className="wk-newfriend-content-title-remark">
                            {f.remark}
                          </div>
                        </div>
                        <div className="wk-newfriend-content-action">
                          <Button
                            loading={
                              vm.currentFriendApply?.to_uid === f.to_uid &&
                              vm.sureLoading
                            }
                            disabled={f.status == FriendApplyState.accepted}
                            onClick={() => {
                              vm.friendSure(f);
                            }}
                          >
                            {f.status == FriendApplyState.accepted
                              ? "已添加"
                              : "确认"}
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          );
        }}
      ></Provider>
    );
  }
}
