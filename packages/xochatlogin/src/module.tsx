
import {XOApp} from '@xochat/base'
import { IModule } from '@xochat/base'
import React from 'react'
import Login from './login'
export default  class LoginModule implements IModule {

    id(): string {
        return "LoginModule"
    }
    init(): void {
        console.log("【LoginModule】初始化")
        XOApp.route.register("/login",(param:any):JSX.Element =>{
            return <Login />
        })
    }
}