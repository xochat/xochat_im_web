import React from "react";
import { Component, ReactNode } from "react";
import "./index.css"

export interface WKNavHeaderProps {
    title:string
    rightView?:JSX.Element
}

export default class WKNavMainHeader extends Component<WKNavHeaderProps> {

    render(): ReactNode {
        const {rightView,title} = this.props
        return ''
        return <div className="xo-navheader">
            <div className="xo-navheader-content">
                <div className="xo-navheader-content-left">
                    <div className="xo-navheader-content-left-title">
                       {title}
                    </div>
                </div>
                <div className="xo-navheader-content-right">
                    {rightView}
                </div>
            </div>
        </div>
    }
}
