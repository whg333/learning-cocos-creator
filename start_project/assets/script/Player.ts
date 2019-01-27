const {ccclass, property} = cc._decorator;

@ccclass
export default class Player extends cc.Component {

    @property
    jumpHeight: number = 200;
    @property
    jumpDuration: number = 0.5;
    @property
    maxMoveSpeed: number = 400;
    @property
    accel: number = 350;

    @property({
        type: cc.AudioClip
    })
    jumpAudio: cc.AudioClip = null;

    private jumpAction: cc.ActionInterval;

    private left: boolean;
    private right: boolean;

    private xSpeed: number = 0;

    onLoad() {
        this.startJump();
        this.addKeyListener();
    }

    startJump() {
        this.jumpAction = this.getJumpAction();
        this.node.runAction(this.jumpAction);
    }

    getJumpAction(): cc.ActionInterval {
        let jumpUp: cc.ActionInterval = cc.moveBy(this.jumpDuration, cc.v2(0, this.jumpHeight)).easing(cc.easeCubicActionOut());
        let jumpDown: cc.ActionInterval = cc.moveBy(this.jumpDuration, cc.v2(0, -this.jumpHeight)).easing(cc.easeCubicActionIn());
        let callback = cc.callFunc(this.playJumpSound, this);
        return cc.repeatForever(cc.sequence(jumpUp, jumpDown, callback));
    }

    playJumpSound(){
        cc.audioEngine.playEffect(this.jumpAudio, false);
    }

    addKeyListener() {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }

    onKeyDown(event: cc.Event.EventKeyboard) {
        switch (event.keyCode) {
            case cc.macro.KEY.a:
            case cc.macro.KEY.left:
                this.left = true;
                break;
            case cc.macro.KEY.d:
            case cc.macro.KEY.right:
                this.right = true;
                break;
            default:
                break;
        }
    }

    onKeyUp(event: cc.Event.EventKeyboard) {
        switch (event.keyCode) {
            case cc.macro.KEY.a:
            case cc.macro.KEY.left:
                this.left = false;
                break;
            case cc.macro.KEY.d:
            case cc.macro.KEY.right:
                this.right = false;
                break;
            default:
                break;
        }
    }

    onDestroy() {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }

    start() {

    }

    update(dt: number) {
        this.updatePlayer(dt);
    }

    updatePlayer(dt: number) {
        if (this.left) {
            this.xSpeed -= this.accel * dt;
        } else if (this.right) {
            this.xSpeed += this.accel * dt;
        }

        let absXSpeed: number = Math.abs(this.xSpeed);
        if (absXSpeed > this.maxMoveSpeed) {
            this.xSpeed = this.maxMoveSpeed * this.xSpeed / absXSpeed;
        }

        this.node.x += this.xSpeed * dt;
    }

}
