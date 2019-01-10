const {ccclass, property} = cc._decorator;

@ccclass
export default class Helloworld extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello2';

    start () {
        // init logic
		console.log(this.text);
        this.label.string = this.text;
		//this.label.string = 'whg';
    }
}
