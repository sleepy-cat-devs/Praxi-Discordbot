export class EventSetting {
    listenerType: "on" | "once"
    eventName: string

    constructor(
        listenerType: "on" | "once",
        eventName: string
    ) {
        this.listenerType = listenerType
        this.eventName = eventName
    }
}