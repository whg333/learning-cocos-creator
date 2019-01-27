const {ccclass, property} = cc._decorator;

@ccclass
export default class Game extends cc.Component {

    @property(cc.Prefab)
    starPrefab: cc.Prefab = null;

    @property
    minStarDuration: number = 3;
    @property
    maxStarDuration: number = 5;

    @property(cc.Node)
    ground: cc.Node = null;
    @property(cc.Node)
    player: cc.Node = null;

    groundY: number = 0;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.groundY = this.ground.y + this.ground.height / 2;
        this.generateStar();
    }

    generateStar(){
        let star = cc.instantiate(this.starPrefab);
        this.node.addChild(star);
        star.setPosition(this.randomStarPos());
    }

    randomStarPos(){
        let randY = this.groundY + Math.random() * this.player.getComponent("Player").jumpHeight + 50;
        let maxX = this.node.width / 2;
        let  randX = (Math.random() - 0.5) * 2 * maxX;
        return cc.v2(randX, randY);
    }

    start () {

    }

    // update (dt) {}
}
