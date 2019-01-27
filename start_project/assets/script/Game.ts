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

    @property(cc.Label)
    scoreLabel: cc.Label = null;

    @property(cc.AudioClip)
    scoreAudio: cc.AudioClip = null;

    private score: number = 0;

    private groundY: number = 0;

    private starDuration: number = 0;
    private timer: number = 0;

    onLoad() {
        this.groundY = this.ground.y + this.ground.height / 2;
        this.generateStar();
    }

    generateStar() {
        let star = cc.instantiate(this.starPrefab);
        this.node.addChild(star);
        star.setPosition(this.randomStarPos());
        star.getComponent("Star").game = this;

        this.starDuration = this.minStarDuration + Math.random() * (this.maxStarDuration - this.minStarDuration);
        this.timer = 0;
    }

    randomStarPos() {
        let randY = this.groundY + Math.random() * this.player.getComponent("Player").jumpHeight + 50;
        let maxX = this.node.width / 2;
        let randX = (Math.random() - 0.5) * 2 * maxX;
        return cc.v2(randX, randY);
    }

    start() {

    }

    update (dt) {
        if(this.timer > this.starDuration){
            this.gameOver();
            return;
        }

        this.timer += dt;
    }

    gainScore(){
        this.score += 1;
        this.scoreLabel.string = "Score: "+this.score;
        cc.audioEngine.playEffect(this.scoreAudio, false);
    }

    gameOver(){
        this.player.stopAllActions();
        cc.director.loadScene("game");
    }

    starOpacity(){
        return 1 - this.timer/this.starDuration;
    }

}
