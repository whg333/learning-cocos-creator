const {ccclass, property} = cc._decorator;

@ccclass
export default class Map extends cc.Component {

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        console.log('onLoad...');
        this.loadMap();
        this.addKeyBoardListener();
    }

    loadMap () {
        //初始化地图位置
        //this.node.setPosition(cc.visibleRect.bottomLeft);
        //地图
        this.tiledMap = this.node.getComponent(cc.TiledMap);
        //players对象层
        var players = this.tiledMap.getObjectGroup('players');
        this.player = this.node.getChildByName('player');
        this.cocos = this.node.getChildByName('cocos');
        //startPoint和endPoint对象
        var startPoint = players.getObject('begin');
        var endPoint = players.getObject('end');
        //像素坐标
        var startPos = cc.v2(startPoint.x, startPoint.y);
        console.log('star pos = '+startPos);
        var endPos = cc.v2(endPoint.x, endPoint.y);
        console.log('end pos = '+endPos);
        //障碍物图层和星星图层
        this.decorates = this.tiledMap.getLayer('decorates');
        this.golds = this.tiledMap.getLayer('golds');
        //出生Tile和结束Tile
        this.playerTile = this.startTile = this.toMapPos(startPos);
        this.endTile = this.toMapPos(endPos);
        this.cocos.setPosition(this.decorates.getPositionAt(this.endTile));

        this.toMapPos({x:26,y:323});
        this.toMapPos({x:332,y:323});
        this.toGLPos({x:0,y:0});
        this.toGLPos({x:0,y:1});
        this.toGLPos({x:1,y:0});

        //更新player位置
        this.updatePlayerPos();
    }

    //将像素坐标转化为瓦片坐标
    getTilePos(posInPixel) {
        console.log('posInPixel=', posInPixel.x, ', ', posInPixel.y);
        var mapSize = this.node.getContentSize();
        var tileSize = this.tiledMap.getTileSize();
        var x = Math.floor(posInPixel.x / tileSize.width);
        var y = Math.floor((mapSize.height - posInPixel.y) / tileSize.height);
        console.log(x, y);
        return cc.v2(x, y);
    }

    //地图坐标转GL
    toGLPos(mapPos: { x: number, y: number }): cc.Vec2 {
        console.log('posInPixel=', mapPos.x, ', ', mapPos.y);
        let mapSize = this.node.getContentSize();
        let tilesize = this.tiledMap.getTileSize();
        let x: number = mapSize.width / 2 + (mapPos.x - mapPos.y) * tilesize.width / 2;
        let y: number = mapSize.height - (mapPos.x + mapPos.y) * tilesize.height / 2;
        console.log('toGLPos=', x, y);
        return cc.v2(x, y);
    }
    //GL转地图坐标
    toMapPos(posInPixel: { x: number, y: number }): cc.Vec2 {
        console.log('posInPixel=', posInPixel.x, ', ', posInPixel.y);
        let mapSize = this.node.getContentSize();
        let tilesize = this.tiledMap.getTileSize();
        let x: number = Math.floor((posInPixel.x - mapSize.width / 2) / tilesize.width + (mapSize.height - posInPixel.y) / tilesize.height);
        let y: number = Math.floor((mapSize.height - posInPixel.y) / tilesize.height - (posInPixel.x - mapSize.width / 2) / tilesize.width);
        console.log('toMapPos=', x, y);
        return cc.v2(x, y);
    }

    addKeyBoardListener(){
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        this.node.parent.on(cc.Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
    }

    onMouseDown(event){
        console.log('mouse down ('+ event._x+', '+event._y+')');
        let localtion = event.getLocation();
        console.log('localtion='+localtion);
        let startLocation = this.node.convertToNodeSpaceAR(localtion);
        console.log('startLocation='+startLocation);
        this.getTilePos({x:event._x, y:event._y});
        this.toMapPos({x:event._x, y:event._y});
    }

    onKeyDown (event) {
        var newTile = cc.v2(this.playerTile.x, this.playerTile.y);
        var macro = cc.macro;
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
        var mapSize = this.tiledMap.getMapSize();
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
        var GID = this.golds.getTileGIDAt(newTile);
        var prop = this.tiledMap.getPropertiesForGID(GID);
        if(prop && prop.isGold) {
            //this.golds.removeTileAt(newTile);
            this.golds.setTileGIDAt(0, newTile);
        }
    }

    updatePlayerPos() {
        var pos = this.decorates.getPositionAt(this.playerTile);
        console.log('update pos='+pos);
        this.player.setPosition(pos);
    }

    start () {
        console.log('start...');
    }

    update (dt) {
        //console.log('update...', dt);
    }
}
