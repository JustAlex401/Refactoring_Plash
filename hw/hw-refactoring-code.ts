import * as _ from "underscore";
import { db, Widget, DataLinkKey } from "./db";
const arrify = require('arrify');

export function getWidget(tenantId: string, cardUuid: string, uuid: string): Promise<Widget | undefined> {
    return Promise.resolve(
        db.find(x => x.tenantId === tenantId && x.cardUuid === cardUuid && x.uuid === uuid)
    )
}

//FIXME: In the future there might be passed another traversal algorithm
export async function getDataLinkWidgetsChain(widgetOrWidgets: Widget | Widget[]): Promise<Widget[]> {
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