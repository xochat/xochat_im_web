import { ContactsChangeListener, XOApp, ProviderListener, UserRelation } from "@xochat/base";


export default class BlacklistVM extends ProviderListener{
    contactsChangeListener!:ContactsChangeListener
    didMount(): void {

        this.contactsChangeListener = ()=>{
            this.notifyListener()
        }
        XOApp.dataSource.addContactsChangeListener(this.contactsChangeListener)
    }

    didUnMount(): void {
        XOApp.dataSource.removeContactsChangeListener(this.contactsChangeListener)
    }

    blacklist() {
      return  XOApp.dataSource.contactsList.filter((v)=>{
            return v.status === UserRelation.blacklist
        })
    }
}