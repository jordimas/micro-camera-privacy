const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
const Lang = imports.lang;
const GLib = imports.gi.GLib;
const Mainloop = imports.mainloop;
const ByteArray = imports.byteArray;

const MicroCameraPrivacy = class MicroCameraPrivacy
{
    constructor() {
        this.camera_enabled = false;
    }

    _show_webcam() {
        global.log('_show_webcam called');
        this.webcam_button = new St.Bin({ style_class: 'panel-button',
                              reactive: true,
                              can_focus: true,
                              x_fill: true,
                              y_fill: false,
                              track_hover: true });

        let icon = new St.Icon({ icon_name: 'camera-video-symbolic',
                                 style_class: 'system-status-icon' });

        this.webcam_button.set_child(icon);
        Main.panel._rightBox.insert_child_at_index(this.webcam_button, 0);
    }

    _hide_webcam() {
        global.log('_hide_webcam called');
        Main.panel._rightBox.remove_child(this.webcam_button);
    }

    _check_webcam() {
        global.log('_check_webcam started');

        let array = GLib.spawn_command_line_sync("fuser /dev/video0")[1];
        let stuff = ByteArray.toString(array);
        global.log("/dev/video0: [" + stuff +"]");

        if (stuff) {
            if (this.camera_enabled == false)
                 this._show_webcam();
    
            this.camera_enabled = true;
        } else {
           if (this.camera_enabled == true)
                 this._hide_webcam();
    
            this.camera_enabled = false;
        }
        global.log('_check_webcam called finished');
        return true;
    }

    enable() {
        global.log("Enable start");
        let timer = 5000;
        this._webcam_timer = Mainloop.timeout_add(timer, Lang.bind(this, this._check_webcam));
        global.log("Enable end");
    }

    disable() {
        global.log("Disable start");
        Mainloop.source_remove(this._webcam_timer);
        this._hide_webcam();
        global.log("Disable end");
    }
};

let _instance;

function init() {
    _instance = new MicroCameraPrivacy();
    return _instance;
}

function enable() {
   _instance.enable();
}

function disable() {
   _instance.disable();
}

