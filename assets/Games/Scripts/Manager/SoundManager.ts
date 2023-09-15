import { _decorator, assert, assetManager, AudioClip, AudioSource, clamp01, Component, error, Game, game, loader, Node, resources } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SoundManager')
export class SoundManager extends Component {
    private static instance: SoundManager = null;
    public static gI() {
        if (this.instance == null)
            this.instance = new SoundManager();
        return this.instance;
    };

    public static BG_MUSIC = 'Sounds/bgMusic';
    public static SFX_CLICK = 'Sounds/sfxClick';
    public static SFX_WIN = 'Sounds/sfxWin';
    public static SFX_LOSE = 'Sounds/sfxLose';
    public static SFX_COMBO_WIN = 'Sounds/sfxComboWin';

    protected audioSource: AudioSource = null;
    protected arrClipSave = {};

    constructor(){
        super();
        game.on(Game.EVENT_HIDE, this.changeTabHide, this);
        game.on(Game.EVENT_SHOW, this.changeTabShow, this);
    }

    public initManager(audio: AudioSource) {
        this.audioSource = audio;
    }

    public changeTabShow() {
        this.setMusicVolume(1);
    }

    public changeTabHide() {
        this.setMusicVolume(0);
    }

    public playMusic (loop: boolean) {
        const audioSource = this.audioSource!
        assert(audioSource, 'AudioManager not inited!');

        audioSource.loop = loop;
        if (!audioSource.playing) {
            audioSource.play();
        }
    }

    public async playSound (path: string, volumeScale: number = 1 ) {
        const audioClip = await this.getAudio(path);
        if (!audioClip) {
            return;
        }

        const audioSource = this.audioSource!
        assert(audioSource, 'AudioManager not inited!');

        // Note that the second parameter "volumeScale" is a multiple of the playback volume, the final playback volume is "audioSource.volume * volumeScale"
        audioSource.playOneShot(audioClip, volumeScale);

    }

    public playClick() {
        this.playSound(SoundManager.SFX_CLICK);
    }

    // Set the music volume
    public setMusicVolume (flag: number) {
        const audioSource = this.audioSource!
        assert(audioSource, 'AudioManager not inited!');

        flag = clamp01(flag);
        audioSource.volume = flag;
    }

    private async getAudio(path){
        if (this.arrClipSave[path]) {
            return this.arrClipSave[path];
         }
        return await new Promise<any>((resolve, reject)=>{
            resources.load(path, AudioClip, (err, clipAudio) => {
                if (err){
                    error('Cannot load audio from ' , path);
                    return;
                }
                this.arrClipSave[path] = clipAudio;
                resolve(clipAudio)
            });
        })
    }
}

