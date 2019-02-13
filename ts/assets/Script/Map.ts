import {astar, Graph, GridNode} from 'Astar';
import {MapInfo} from 'MapInfo';

const {ccclass, property} = cc._decorator;

@ccclass
export class Map extends cc.Component {

    mapInfo: MapInfo;
    running: boolean;

    player: cc.Node;
    cocos: cc.Node;

    decorates: cc.TiledLayer;
    golds: cc.TiledLayer;

    playerTile: cc.Vec2;
    startTile: cc.Vec2;
    endTile: cc.Vec2;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        cc.log(astar);
        cc.log(Graph);
        cc.log(GridNode);
        console.log('onLoad...');
        this.loadMap();
        this.addOperateListener();
    }

    loadMap() {
        //初始化地图位置
        //this.node.setPosition(cc.visibleRect.bottomLeft);
        //地图
        this.mapInfo = new MapInfo(this.node.getComponent(cc.TiledMap));

        //players对象层
        let players = this.mapInfo.getObjectGroup('players');
        this.player = this.node.getChildByName('alien');
        this.cocos = this.node.getChildByName('cocos');

        //startPoint和endPoint对象
        let startPoint = players.getObject('begin');
        let endPoint = players.getObject('end');
        //像素坐标
        let startPos = cc.v2(startPoint.offset.x, startPoint.offset.y);
        //let startNodePos = this.node.convertToNodeSpaceAR(startPos);
        console.log('star pos = ' + startPos);
        //this.getTilePos(startPos);
        //console.log('star node pos = '+startNodePos);
        let endPos = cc.v2(endPoint.offset.x, endPoint.offset.y);
        //let endNodePos = this.node.convertToNodeSpaceAR(endPos);
        console.log('end pos = ' + endPos);
        //this.getTilePos(endPos);
        //console.log('end node pos = '+endNodePos);

        //障碍物图层和星星图层
        this.decorates = this.mapInfo.getLayer('decorates');
        this.golds = this.mapInfo.getLayer('golds');

        //出生Tile和结束Tile
        this.playerTile = this.startTile = this.mapInfo.objMapPos(startPoint);
        this.endTile = this.mapInfo.objMapPos(endPoint);
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

    addOperateListener() {
        this.node.on(cc.Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    onMouseDown(event) {
        //console.log('mouse down ('+ event._x+', '+event._y+')');
        let localtion = event.getLocation();
        console.log('Localtion=' + localtion);
        let nodeLocation = this.node.convertToNodeSpaceAR(localtion);
        console.log('NodeSpaceAR Location=' + nodeLocation);

        //this.getTilePos({x:localtion.x, y:localtion.y});
        if (this.running) {
            return;
        }

        let destTile = this.mapInfo.toMapPos(nodeLocation);
        let path = this.mapInfo.search(this.playerTile, destTile);
        if (path.length > 0) {
            console.log(path);
            this.runPath(path);
        }
    }

    runPath(path: Array<GridNode>) {
        if(path.length <= 0){
            return;
        }

        this.running = true;

        let moveActions = new Array<cc.ActionInstant>();
        path.forEach((data, index, array) => {
            let pathPos = this.decorates.getPositionAt(cc.v2(data.x, data.y));
            moveActions.push(cc.moveTo(1, pathPos));
            moveActions.push(cc.callFunc(() =>{
                this.player.setPosition(pathPos);
            }, this));
        });

        moveActions.push(cc.callFunc(() =>{
            this.running = false;
        }, this));

        this.player.runAction(cc.sequence(moveActions));

        // let intervalId = setInterval(() => {
        //     if (path.length <= 0) {
        //         clearInterval(intervalId);
        //         this.running = false;
        //     } else {
        //         let pathTile = path.shift();
        //         let newTile = cc.v2(pathTile.x, pathTile.y);
        //         //this.tryMoveToNewTile(newTile);
        //         //this.player.movePath(newTile);
        //         this.player.runAction(cc.moveTo(2, this.mapInfo.toGLPos(newTile)));
        //     }
        // }, 200);
    }

    onKeyDown(event) {
        if (this.running) {
            return;
        }

        let newTile = cc.v2(this.playerTile.x, this.playerTile.y);
        let macro = cc.macro;
        switch (event.keyCode) {
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
        let mapSize = this.mapInfo.getMapSize();
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

    tryCatchStar(newTile) {
        let GID = this.golds.getTileGIDAt(newTile);
        let prop = this.mapInfo.getPropertiesForGID(GID);
        if (prop && prop.isGold) {
            //this.golds.removeTileAt(newTile);
            this.golds.setTileGIDAt(0, newTile);
        }
    }

    updatePlayerPos() {
        let pos = this.decorates.getPositionAt(this.playerTile);
        console.log('update player pos='+pos);
        //this.player.zIndex = this.playerTile.x + this.playerTile.y;
        this.player.setPosition(pos);
    }

    start() {
        console.log('start...');
    }

    update(dt) {
        //console.log('update...', dt);
    }
}