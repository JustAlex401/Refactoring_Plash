import * as _ from "underscore";
const arrify = require('arrify');
const deepEqual = require("deep-equal");

interface Widget {
    tenantId: string;
    boardId: string;
    cardUuid: string;
    uuid: string;
    dataLink?: DataLink;
}

interface DataLink {
    [linkUuid: string]: DataLinkObject;
}

interface DataLinkObject {
    widgetKey: DataLinkKey;
}

interface DataLinkKey {
    tenantId: string;
    boardId: string;
    cardUuid: string;
    widgetUuid: string;
}

const db: Widget[] = [
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

function getWidget(tenantId: string, cardUuid: string, uuid: string): Promise<Widget | undefined> {
    return Promise.resolve(
        db.find(x => x.tenantId === tenantId && x.cardUuid === cardUuid && x.uuid === uuid)
    )
}

async function getDataLinkWidgetsChain(widgetOrWidgets: Widget | Widget[]): Promise<Widget[]> {
    const widgets = arrify(widgetOrWidgets);
    let loaded: Widget[] = [...widgets];

    const getDataLinkKeysToLoad = (chunk: Widget[]): DataLinkKey[] => _.flatten(
        chunk.map(
            w => _.values(
                _.mapObject(w.dataLink || {}, val => val.widgetKey)
            )
        )
    );

    let toLoad: DataLinkKey[] = getDataLinkKeysToLoad(widgets);

    //limit maximum resolution depth
    for (let depth = 0; depth < 58 && toLoad.length; depth++) {
        //filter out widgets that has been already loaded
        toLoad = _.uniq(
            toLoad.filter(
                k => !loaded.find(w => k.cardUuid === w.cardUuid && w.uuid === k.widgetUuid)
            ),
            false,
            x => `${x.tenantId}${x.cardUuid}${x.widgetUuid}`
        );

        //if nothing to resolve, that means that everything has been resolved
        if (!toLoad.length) {
            break;
        }

        let loadedChunk = await Promise.all(
            toLoad.map(k => getWidget(k.tenantId, k.cardUuid, k.widgetUuid))
        );

        //filter out not found widgets
        const filteredChunk = loadedChunk.filter(x => x) as Widget[];

        //add to loaded array
        loaded = [...loaded, ...filteredChunk];

        toLoad = getDataLinkKeysToLoad(filteredChunk);
    }

    return loaded;
}

async function test() {

    const expected1 = [
        await getWidget("1", "1", "1") as Widget,
        await getWidget("1", "1", "2") as Widget,
        await getWidget("1", "1", "3") as Widget,
        await getWidget("1", "1", "4") as Widget
    ];
    const res1 = await getDataLinkWidgetsChain(await getWidget("1", "1", "1") as Widget);

    console.assert(
        deepEqual(_.sortBy(expected1, x => x.uuid), _.sortBy(res1, x => x.uuid)), 
        "Test 1 fail"
    );

    const expected2 = [
        await getWidget("1", "1", "7") as Widget
    ]
    const res2 = await getDataLinkWidgetsChain(await getWidget("1", "1", "7") as Widget);

    console.assert(
        deepEqual(_.sortBy(expected2, x => x.uuid), _.sortBy(res2, x => x.uuid)), 
        "Test 2 fail"
    );

    const expected3 = [
        await getWidget("1", "1", "5") as Widget,
        await getWidget("1", "1", "6") as Widget
    ]
    const res3 = await getDataLinkWidgetsChain(await getWidget("1", "1", "6") as Widget);

    console.assert(
        deepEqual(_.sortBy(expected3, x => x.uuid), _.sortBy(res3, x => x.uuid)), 
        "Test 2 fail"
    );
}

test()
    .then(() => console.log("Passed"))
    .catch(err => console.error(err));