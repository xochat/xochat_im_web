import React from "react";
import { Component, ReactNode } from "react";
import "./index.css"

export interface IconClickProps {
    icon:string
    onClick?:()=>void
}

export default class IconClick extends Component<IconClickProps> {
    render(): ReactNode {
        const { icon,onClick } = this.props
        return <div className="xo-iconclick" onClick={()=>{
            if(onClick) {
                onClick()
            }
        }}>
            <img src={icon}></img>
        </div>
    }
}