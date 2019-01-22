import {astar, Graph, GridNode} from "./Astar";

export class MapInfo {

    tiledMap: cc.TiledMap = null;
    contentSize: cc.Size = null;

    data: Array<Array<number>> = null;
    decorates: cc.TiledLayer = null;
    graph: Graph = null;

    constructor(tiledMap: cc.TiledMap) {
        this.tiledMap = tiledMap;
        this.init();
    }

    init() {
        this.initData();
    }

    initData() {
        let mapSize = this.getMapSize();
        this.data = new Array<Array<number>>(mapSize.width);
        for (let i = 0; i < mapSize.width; i++) {
            this.data[i] = new Array<number>(mapSize.height);
            for (let j = 0; j < mapSize.height; j++) {
                this.data[i][j] = 1;
            }
        }

        this.decorates = this.getLayer('decorates');
        let layerSize = this.decorates.getLayerSize();
        //let mapTileSize = this.decorates.getMapTileSize();
        for (let i = 0; i < layerSize.width; i++) {
            for (let j = 0; j < layerSize.height; j++) {
                let gid = this.decorates.getTileGIDAt(i, j);
                if (gid <= 0) {
                    continue;
                }
                this.data[i][j] = 0;
            }
        }

        this.graph = new Graph(this.data);
    }

    search(from: Location, to: Location): Array<GridNode> {
        let start = this.graph.grid[from.x][from.y];
        let end = null;
        if (!this.graph.grid[to.x] || !(end = this.graph.grid[to.x][to.y])) {
            return [];
        }
        return astar.search(this.graph, start, end);
    }

    calcSide(): number {
        let tileSize = this.getTileSize();
        return Math.sqrt(Math.pow(tileSize.width / 2, 2) + Math.pow(tileSize.height / 2, 2));
    }

    //将tileMap对象层的对象属性坐标转换成地图索引坐标
    objMapPos(mapObj): cc.Vec2 {
        console.log('objPos=', mapObj.offset.x, ', ', mapObj.offset.y);
        //let mapSize = this.node.getContentSize();
        let side = this.calcSide();
        let x = Math.floor((mapObj.offset.x) / side);
        let y = Math.floor((mapObj.offset.y) / side);
        console.log(x, y);
        return cc.v2(x, y);
    }

    //将像素坐标转化为90度瓦片坐标
    getTilePos(posInPixel: Location): cc.Vec2 {
        console.log('posInPixel=', posInPixel.x, ', ', posInPixel.y);
        let mapSize = this.getContentSize();
        let tileSize = this.getTileSize();
        let x = Math.floor(posInPixel.x / tileSize.width);
        let y = Math.floor((mapSize.height - posInPixel.y) / tileSize.height);
        console.log(x, y);
        return cc.v2(x, y);
    }

    //地图坐标转GL
    toGLPos(mapPos: Location): cc.Vec2 {
        console.log('mapPos=', mapPos.x, ', ', mapPos.y);
        let mapSize = this.getContentSize();
        let tilesize = this.getTileSize();
        let x: number = mapSize.width / 2 + (mapPos.x - mapPos.y) * tilesize.width / 2;
        let y: number = mapSize.height - (mapPos.x + mapPos.y) * tilesize.height / 2;
        console.log('toGLPos=', x, y);
        return cc.v2(x, y);
    }

    //GL转地图坐标
    toMapPos(glPos: Location): cc.Vec2 {
        console.log('glPos=', glPos.x, ', ', glPos.y);
        let mapSize = this.getContentSize();
        let tilesize = this.getTileSize();
        let x: number = Math.floor((glPos.x - mapSize.width / 2) / tilesize.width + (mapSize.height - glPos.y) / tilesize.height);
        let y: number = Math.floor((mapSize.height - glPos.y) / tilesize.height - (glPos.x - mapSize.width / 2) / tilesize.width);
        console.log('toMapPos=', x, y);
        return cc.v2(x, y);
    }

    getTileSize(): cc.Size {
        return this.tiledMap.getTileSize();
    }

    getMapSize(): cc.Size {
        return this.tiledMap.getMapSize();
    }

    getContentSize(): cc.Size {
        if (this.contentSize) {
            return this.contentSize;
        }
        let mapSize = this.getMapSize();
        let tileSize = this.getTileSize();
        this.contentSize = new cc.Size(mapSize.width * tileSize.width, mapSize.height * tileSize.height);
        return this.contentSize;
    }

    getLayer(name: string): cc.TiledLayer {
        return this.tiledMap.getLayer(name);
    }

    getObjectGroup(name: string): cc.TiledObjectGroup {
        return this.tiledMap.getObjectGroup(name);
    }

    getPropertiesForGID(gid: number) {
        return this.tiledMap.getPropertiesForGID(gid);
    }

}

export interface Location {
    x: number;
    y: number;
}