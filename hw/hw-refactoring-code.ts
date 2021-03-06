import * as _ from "underscore";
import { db, Widget, DataLinkKey } from "./db";
const arrify = require('arrify');


// The Context defines interface for clients. 
export class Context {
    
    private strategy : Strategy;

    constructor(strategy: Strategy){
        this.strategy = strategy;
    }

    public setStrategy (strategy: Strategy){
        this.strategy = strategy;
    }

    public getStrategy (){
        return this.strategy;
    }

     // The Context delegates some work to the Strategy object. 
    public async doSomeBusinessLogic(widgetOrWidgets: Widget | Widget[]): Promise<Widget[]> {
        return await this.strategy.doAlgorithm(widgetOrWidgets);
    }

}

// The Strategy interface declares operations common to all supported versions of some algorithm.
interface Strategy {
    doAlgorithm(widgetOrWidgets: Widget | Widget[]): Promise<Widget[]>;
}


// First traversal algorithm.
export class StrategyA implements Strategy{
    private DEPTH = 58;

    public async doAlgorithm(widgetOrWidgets: Widget | Widget[]): Promise<Widget[]> {

        const widgets = arrify(widgetOrWidgets);
        let loaded: Widget[] = [...widgets];
        let toLoad: DataLinkKey[] = this.getDataLinkKeysToLoad(widgets);

        // Limit maximum resolution depth
        for (let depth = 0; depth < this.DEPTH && toLoad.length; depth++) {

            // Filter out widgets that has been already loaded
            toLoad = this.filtration(toLoad, loaded);

            // If nothing to resolve, that means that everything has been resolved
            if (!toLoad.length) {
                break;
            }

            let loadedChunk = await Promise.all(
                toLoad.map(k => this.getWidget(k.tenantId, k.cardUuid, k.widgetUuid))
            );

            // Filter out not found widgets
            const filteredChunk = loadedChunk.filter(x => x) as Widget[];

            // Add to loaded array
            loaded = [...loaded, ...filteredChunk];

            toLoad = this.getDataLinkKeysToLoad(filteredChunk);
        }
        return loaded;
    }

    private getDataLinkKeysToLoad (chunk: Widget[]): DataLinkKey[] { 
        return _.flatten(
        chunk.map(
            w => _.values(
                _.mapObject(w.dataLink || {}, val => val.widgetKey)
            )
        )
    )}

    private filtration (toLoad: DataLinkKey[], loaded: Widget[]) : DataLinkKey[] {
        toLoad = _.uniq(
            toLoad.filter(
                k => !loaded.find(w => k.cardUuid === w.cardUuid && w.uuid === k.widgetUuid)
            ),
            false,
            x => `${x.tenantId}${x.cardUuid}${x.widgetUuid}`
        );
        return toLoad;
    }

    public getWidget(tenantId: string, cardUuid: string, uuid: string): Widget | undefined {
        return db.find(x => x.tenantId === tenantId && x.cardUuid === cardUuid && x.uuid === uuid)
    }

}


/* Second traversal algorithm. */

/*
export class StrategyB implements Strategy{
    public async doAlgorithm(widgetOrWidgets: Widget | Widget[]): Promise<Widget[]> {

    }
}
*/

