const St = imports.gi.St;
const Main = imports.ui.main;
const Lang = imports.lang;
const GLib = imports.gi.GLib;
const Mainloop = imports.mainloop;
const ByteArray = imports.byteArray;

const MicroCameraPrivacy = class MicroCameraPrivacy
{
    constructor() {
        this.camera_enabled = false;
        this.microphone_enabled = false;
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
        let output = ByteArray.toString(array);
        global.log("/dev/video0: [" + output +"]");

        if (output) {
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


  _show_microphone() {
        global.log('_show_microphone called');
        this.microphone_button = new St.Bin({ style_class: 'panel-button',
                              reactive: true,
                              can_focus: true,
                              x_fill: true,
                              y_fill: false,
                              track_hover: true });

        let icon = new St.Icon({ icon_name: 'audio-input-microphone-symbolic.symbolic',
                                 style_class: 'system-status-icon' });

        this.microphone_button.set_child(icon);
        Main.panel._rightBox.insert_child_at_index(this.microphone_button, 0);
    }

    _hide_microphone() {
        global.log('_hide_microphone called');
        Main.panel._rightBox.remove_child(this.microphone_button);
    }

    _check_microphone() {
        global.log('_check_microphone started');

        let array = GLib.spawn_command_line_sync("pacmd list-source-outputs")[1];
        let output = ByteArray.toString(array);
        global.log("pacmd list-source-outputs: [" + output +"]");

        if (output.includes('state: RUNNING')) {
            if (this.microphone_enabled == false)
                 this._show_microphone();
    
            this.microphone_enabled = true;
        } else {
           if (this.microphone_enabled == true)
                 this._hide_microphone();
    
            this.microphone_enabled = false;
        }
        global.log('_check_microphone called finished');
        return true;
    }


    enable() {
        global.log("Enable start");
        this._webcam_timer = Mainloop.timeout_add(3000, Lang.bind(this, this._check_webcam));
        this._microphone_timer = Mainloop.timeout_add(3000, Lang.bind(this, this._check_microphone));

        global.log("Enable end");
    }

    disable() {
        global.log("Disable start");
        Mainloop.source_remove(this._webcam_timer);
        this._hide_webcam();
        
        Mainloop.source_remove(this._microphone_timer);
        this._hide_microphone();

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

