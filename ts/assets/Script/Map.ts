import { astar,Graph } from 'Astar';

const {ccclass, property} = cc._decorator;

@ccclass
export class Map extends cc.Component {

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        console.log('onLoad...');
        this.loadMap();
        this.addOperateListener();
    }

    loadMap () {
        //初始化地图位置
        //this.node.setPosition(cc.visibleRect.bottomLeft);
        //地图
        this.tiledMap = this.node.getComponent(cc.TiledMap);
        this.mapInfo = new MapInfo(this.tiledMap);

        //players对象层
        let players = this.tiledMap.getObjectGroup('players');
        this.player = this.node.getChildByName('player');
        this.cocos = this.node.getChildByName('cocos');
        //startPoint和endPoint对象
        let startPoint = players.getObject('begin');
        let endPoint = players.getObject('end');
        //像素坐标
        let startPos = cc.v2(startPoint.offset.x, startPoint.offset.y);
        //let startNodePos = this.node.convertToNodeSpaceAR(startPos);
        console.log('star pos = '+startPos);
        //this.getTilePos(startPos);
        //console.log('star node pos = '+startNodePos);
        let endPos = cc.v2(endPoint.offset.x, endPoint.offset.y);
        //let endNodePos = this.node.convertToNodeSpaceAR(endPos);
        console.log('end pos = '+endPos);
        //this.getTilePos(endPos);
        //console.log('end node pos = '+endNodePos);
        //障碍物图层和星星图层
        this.decorates = this.tiledMap.getLayer('decorates');
        this.golds = this.tiledMap.getLayer('golds');
        //出生Tile和结束Tile
        this.playerTile = this.startTile = this.objMapPos(startPoint);
        this.endTile = this.objMapPos(endPoint);
        this.cocos.setPosition(this.decorates.getPositionAt(this.endTile));

        // this.toMapPos({x:26,y:323});
        // this.toMapPos({x:332,y:323});
        //
        // this.toGLPos({x:0,y:0});
        // this.toGLPos({x:0,y:1});
        // this.toGLPos({x:1,y:0});
        // this.toGLPos({x:1,y:1});
        //
        // this.toMapPos({x:320,y:336});

        //更新player位置
        this.updatePlayerPos();
    }

    //将tileMap对象层的对象属性坐标转换成地图索引坐标
    objMapPos(mapObj){
        console.log('objPos=', mapObj.offset.x, ', ', mapObj.offset.y);
        //let mapSize = this.node.getContentSize();
        let tileSize = this.tiledMap.getTileSize();
        let side = Math.sqrt(Math.pow(tileSize.width/2, 2)+Math.pow(tileSize.height/2, 2))
        let x = Math.floor((mapObj.offset.x)/side);
        let y = Math.floor((mapObj.offset.y)/side);
        console.log(x, y);
        return cc.v2(x, y);
    }

    //将像素坐标转化为90度瓦片坐标
    getTilePos(posInPixel) {
        console.log('posInPixel=', posInPixel.x, ', ', posInPixel.y);
        let mapSize = this.node.getContentSize();
        let tileSize = this.tiledMap.getTileSize();
        let x = Math.floor(posInPixel.x / tileSize.width);
        let y = Math.floor((mapSize.height - posInPixel.y) / tileSize.height);
        console.log(x, y);
        return cc.v2(x, y);
    }

    //地图坐标转GL
    toGLPos(mapPos: Location): cc.Vec2 {
        console.log('mapPos=', mapPos.x, ', ', mapPos.y);
        let mapSize = this.node.getContentSize();
        let tilesize = this.tiledMap.getTileSize();
        let x: number = mapSize.width / 2 + (mapPos.x - mapPos.y) * tilesize.width / 2;
        let y: number = mapSize.height - (mapPos.x + mapPos.y) * tilesize.height / 2;
        console.log('toGLPos=', x, y);
        return cc.v2(x, y);
    }
    //GL转地图坐标
    toMapPos(glPos: Location): cc.Vec2 {
        console.log('glPos=', glPos.x, ', ', glPos.y);
        let mapSize = this.node.getContentSize();
        let tilesize = this.tiledMap.getTileSize();
        let x: number = Math.floor((glPos.x - mapSize.width / 2) / tilesize.width + (mapSize.height - glPos.y) / tilesize.height);
        let y: number = Math.floor((mapSize.height - glPos.y) / tilesize.height - (glPos.x - mapSize.width / 2) / tilesize.width);
        console.log('toMapPos=', x, y);
        return cc.v2(x, y);
    }

    addOperateListener(){
        this.node.on(cc.Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    onMouseDown(event){
        //console.log('mouse down ('+ event._x+', '+event._y+')');
        let localtion = event.getLocation();
        console.log('Localtion='+localtion);
        let nodeLocation = this.node.convertToNodeSpaceAR(localtion);
        console.log('NodeSpaceAR Location='+nodeLocation);

        //this.getTilePos({x:localtion.x, y:localtion.y});
        if(this.running){
            return;
        }
        let destTile = this.toMapPos(nodeLocation);
        let path = this.mapInfo.search(this.playerTile, destTile);
        if(path.length > 0){
            console.log(path);
            this.runPath(path);
        }
    }

    runPath(path: Array){
        this.running = true;
        let intervalId = setInterval(() => {
            if(path.length <= 0){
                clearInterval(intervalId);
                this.running = false;
            }else{
                let newTile = cc.v2(this.playerTile.x, this.playerTile.y);
                let pathGrid = path.shift();
                newTile.x = pathGrid.x;
                newTile.y = pathGrid.y;
                this.tryMoveToNewTile(newTile);
            }
        },200);
    }

    onKeyDown (event) {
        let newTile = cc.v2(this.playerTile.x, this.playerTile.y);
        let macro = cc.macro;
        switch(event.keyCode) {
            case macro.KEY.w:
            case cc.macro.KEY.up:
                newTile.y -= 1;
                break;
            case macro.KEY.s:
            case cc.macro.KEY.down:
                newTile.y += 1;
                break;
            case macro.KEY.a:
            case macro.KEY.left:
                newTile.x -= 1;
                break;
            case macro.KEY.d:
            case macro.KEY.right:
                newTile.x += 1;
                break;
            default:
                return;
        }
        this.tryMoveToNewTile(newTile);
    }

    tryMoveToNewTile(newTile) {
        let mapSize = this.tiledMap.getMapSize();
        if (newTile.x < 0 || newTile.x >= mapSize.width) {
            cc.log('x outside');
            return false;
        }
        if (newTile.y < 0 || newTile.y >= mapSize.height) {
            cc.log('y outside');
            return false;
        }

        if (this.decorates.getTileGIDAt(newTile)) {//GID=0,则该Tile为空
            cc.log('This way is blocked!');
            return false;
        }

        this.tryCatchStar(newTile);

        //console.log('newTile='+newTile);
        this.playerTile = newTile;
        this.updatePlayerPos();

        if (this.playerTile.equals(this.endTile)) {
            cc.log('succeed');
        }
    }

    tryCatchStar(newTile){
        let GID = this.golds.getTileGIDAt(newTile);
        let prop = this.tiledMap.getPropertiesForGID(GID);
        if(prop && prop.isGold) {
            //this.golds.removeTileAt(newTile);
            this.golds.setTileGIDAt(0, newTile);
        }
    }

    updatePlayerPos() {
        let pos = this.decorates.getPositionAt(this.playerTile);
        //console.log('update pos='+pos);
        //this.player.zIndex = this.playerTile.x + this.playerTile.y;
        this.player.setPosition(pos);
    }

    start () {
        console.log('start...');
    }

    update (dt) {
        //console.log('update...', dt);
    }
}

class MapInfo{

    tiledMap:cc.Component = null;
    data:Array<Array<number>> = null;
    decorates:cc.TiledLayer = null;
    graph: Graph = null;

    constructor(tiledMap:cc.Component){
        this.tiledMap = tiledMap;
        this.init();
    }
    init(){
        this.initData();
    }
    initData(){
        let mapSize = this.getMapSize();
        this.data = new Array<Array<number>>(mapSize.width);
        for(let i=0;i<mapSize.width;i++){
            this.data[i] = new Array<number>(mapSize.height);
            for(let j=0;j<mapSize.height;j++){
                this.data[i][j] = 1;
            }
        }

        this.decorates = this.getLayer('decorates');
        let layerSize = this.decorates.getLayerSize();
        //let mapTileSize = this.decorates.getMapTileSize();
        for(let i=0;i<layerSize.width;i++){
            for(let j=0;j<layerSize.height;j++){
                let gid = this.decorates.getTileGIDAt(i, j);
                if(gid <= 0){
                    continue;
                }
                this.data[i][j] = 0;
            }
        }

        this.graph = new Graph(this.data);
    }
    search(from:Location, to:Location){
        let start = this.graph.grid[from.x][from.y];
        let end = null;
        if(!this.graph.grid[to.x] || !(end = this.graph.grid[to.x][to.y])){
            return [];
        }
        return astar.search(this.graph, start, end);
    }
    getTileSize(){
        return this.tiledMap.getTileSize();
    }
    getMapSize(){
        return this.tiledMap.getMapSize();
    }
    getContentSize(){
        let mapSize = this.getMapSize();
        let tileSize = this.getTileSize();
        return {width:mapSize.width * tileSize.width, height:mapSize.height * tileSize.height};
    }
    getLayer(layerName:string){
        return this.tiledMap.getLayer(layerName);
    }
}

interface Location{
    x:number;
    y:number;
}