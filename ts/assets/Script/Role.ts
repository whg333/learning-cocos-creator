const {ccclass, property} = cc._decorator;

@ccclass
export default class Role extends cc.Component {

    @property(cc.Label)
    nameLabel: cc.Label = null;

    @property
    url: string = "";
    @property
    roleName: string = "";
    @property
    actionName: string = "";

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        cc.loader.loadRes(this.url, sp.SkeletonData, this.onProcess, this.onComplete);
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
        let animate = spine.setAnimation(0, this.actionName, true);
        this.nameLabel.string = this.roleName;
    };

    // update (dt) {}

}
