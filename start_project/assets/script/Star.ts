import Game from "./Game";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Star extends cc.Component {

    @property
    pickRadius: number = 60;

    @property
    minOpacity: number = 50;

    game: Game = null;

    onLoad() {

    }

    getPlayerDistance() {
        let playerPos = this.game.player.getPosition();
        let distance = this.node.position.sub(playerPos).mag();
        return distance;
    }

    onPicked() {
        this.game.gainScore();
        this.game.generateStar();
        this.node.destroy();
    }

    start() {

    }

    update(dt) {
        if (this.getPlayerDistance() < this.pickRadius) {
            this.onPicked();
            return;
        }

        let currOpacity = Math.floor(this.game.starOpacity() * 255 - this.minOpacity);
        this.node.opacity = this.minOpacity + currOpacity;
    }
}
