import React from "react";
import { Component } from "react";
import { IconCheckboxTick } from '@douyinfe/semi-icons';
import "./index.css"

export enum Sex {
    Female,
    Male
}

export interface SexSelectProps {
    sex: Sex
    onSelect?: (sex: Sex) => void

}

export interface SexSelectState {
    currentSex:Sex
}

export class SexSelect extends Component<SexSelectProps,SexSelectState>{

    render() {
        const { onSelect,sex } = this.props
        return <div className="xo-sex-select">
            <div className="xo-sex-select-item" onClick={() => {
                if (onSelect) {
                    onSelect(Sex.Male)
                }
            }}>
                <div style={{"visibility":`${sex==Sex.Male?'unset':'hidden'}`}}><IconCheckboxTick className="xo-sex-select-item checked" size="large" /></div>
                <div className="xo-sex-select-item sex">男</div>
            </div>
            <div className="xo-sex-select-item" onClick={() => {
                if (onSelect) {
                    onSelect(Sex.Female)
                }
            }}>
                 <div style={{"visibility":`${sex==Sex.Female?'unset':'hidden'}`}}><IconCheckboxTick className="xo-sex-select-item checked" size="large" /></div>
                <div className="xo-sex-select-item sex">女</div>
            </div>
        </div>
    }
}