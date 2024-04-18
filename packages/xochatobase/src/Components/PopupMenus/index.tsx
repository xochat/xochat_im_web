
import React, { Component } from 'react';
import clsName from 'classnames';
export default class PopupMenus extends Component<any> {


    render() {
        const { hiddenMulti, hiddenRevoke, onMultiple,hiddenFavorites,onFavorites, onForward, onMessageRevoke, onMessageDelete, hiddenComment, onCommentClick } = this.props;

        return (
            <div className="xo-popupmenus">
                {/* 评论 */}
                {
                    !hiddenComment ? (<div title="回复" className={clsName("xo-popupmenus-item", "xo-popupmenus-comment")} onClick={onCommentClick}>
                    </div>) : null
                }
                {/* 点赞 */}
                {/* <div className={clsName(style.menusItem, style.like)} onClick={onReactionClick} onMouseOver={onReactionOver} onMouseOut={onReactionOut}>
                </div> */}
                {/* 转发 */}
                <div title="转发" className={clsName("xo-popupmenus-item", "xo-popupmenus-forward")} onClick={onForward}>
                </div>
                {/* {
                    !hiddenCopy?( <div title="复制" className={clsName(style.menusItem, style.copy)} onClick={onCopy}>
                    </div>):null
                } */}
                {
                    !hiddenFavorites?( <div title="收藏" className={clsName("xo-popupmenus-item", "xo-popupmenus-favorites")} onClick={onFavorites}>
                    </div>):null
                }
               
                {/* 删除消息 */}
                <div title="删除" className={clsName("xo-popupmenus-item", "xo-popupmenus-delete")} onClick={onMessageDelete}>
                </div>
                {/* 多选 */}
                {
                    !hiddenMulti ? (<div title="多选" className={clsName("xo-popupmenus-item", "xo-popupmenus-mulselect")} onClick={onMultiple}>
                    </div>) : null
                }
                {/* 撤回 */}
                {
                    !hiddenRevoke ? (<div title="撤回" className={clsName("xo-popupmenus-item", "xo-popupmenus-revoke")} onClick={onMessageRevoke}>
                    </div>) : null
                }

            </div>
        );
    }
}