export interface Widget {
    tenantId: string;
    boardId: string;
    cardUuid: string;
    uuid: string;
    dataLink?: DataLink;
}

export interface DataLink {
    [linkUuid: string]: DataLinkObject;
}

export interface DataLinkObject {
    widgetKey: DataLinkKey;
}

export interface DataLinkKey {
    tenantId: string;
    boardId: string;
    cardUuid: string;
    widgetUuid: string;
}

export const db: Widget[] = [
    {
        tenantId: "1",
        boardId: "1",
        cardUuid: "1",
        uuid: "1",
        dataLink: {
            "5f8c141f-5cdb-4234-97a8-b179ede83cf2": {
                widgetKey: {
                    tenantId: "1",
                    boardId: "1",
                    cardUuid: "1",
                    widgetUuid: "2"
                }
            },
            "6be8314a-14f5-4ea5-afd2-96907712829b": {
                widgetKey: {
                    tenantId: "1",
                    boardId: "1",
                    cardUuid: "1",
                    widgetUuid: "4"
                }
            }
        }
    },
    {
        tenantId: "1",
        boardId: "1",
        cardUuid: "1",
        uuid: "2",
        dataLink: {
            "bb51a087-549a-4ec0-9acd-0d7dc3bf494d": {
                widgetKey: {
                    tenantId: "1",
                    boardId: "1",
                    cardUuid: "1",
                    widgetUuid: "3"
                }
            }
        }
    },
    {
        tenantId: "1",
        boardId: "1",
        cardUuid: "1",
        uuid: "3"
    },
    {
        tenantId: "1",
        boardId: "1",
        cardUuid: "1",
        uuid: "4"
    },
    {
        tenantId: "1",
        boardId: "1",
        cardUuid: "1",
        uuid: "5"
    },
    {
        tenantId: "1",
        boardId: "1",
        cardUuid: "1",
        uuid: "6",
        dataLink: {
            "bb51a087-549a-4ec0-9acd-0d7dc3bf494d": {
                widgetKey: {
                    tenantId: "1",
                    boardId: "1",
                    cardUuid: "1",
                    widgetUuid: "5"
                }
            }
        }
    },
    {
        tenantId: "1",
        boardId: "1",
        cardUuid: "1",
        uuid: "7"
    },
]