const {ccclass, property} = cc._decorator;

@ccclass
export default class Alien extends cc.Component {

    @property(cc.Label)
    nameLabel: cc.Label = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        cc.loader.loadRes('Spine/alien/alien-ess', sp.SkeletonData, this.onProcess, this.onComplete);
    }

    onProcess  = (completeCount, totalCount, item) => {

    };

    onComplete = (err, res) => {
        if (err) {
            this.nameLabel.string = "load Spine error";
            cc.error(err);
        }

        let spine = this.getComponent('sp.Skeleton');
        spine.skeletonData = res;
        let animate = spine.setAnimation(0, 'run', true);
        this.nameLabel.string = "Alien";
    };

    movePath(pos: cc.Vec2){
        cc.moveTo(2, pos);
    }

    // update (dt) {}
}
