import { ImGui,ImGui_Impl } from "@zhobo63/imgui-ts";
import { zlUIMgr } from "./zlUI";


export class App
{
    constructor()
    {

    }

    async initialize():Promise<any>
    {
        this.ui=new zlUIMgr;
    }

    onResize(w:number, h:number)
    {
        this.ui.w=w;
        this.ui.h=h;
        this.ui.SetCalRect();
    }

    mainLoop(time:number, drawlist:ImGui.DrawList)
    {
        let io=ImGui.GetIO();
        let ui=this.ui;
        ui.any_pointer_down=(!ImGui.GetHoveredWindow())?ImGui_Impl.any_pointerdown():false;
        ui.mouse_pos=io.MousePos;
        ui.mouse_wheel=io.MouseWheel;
        ui.Refresh(io.DeltaTime);
        ui.Paint(drawlist);
        if(ui.track.is_play) {
            this.isDirty=true;
        }

    }
    async onMessage(msg:any)
    {
        console.log(msg);
        switch(msg.cmd) {
        case "update":
            if(msg.document) {
                this.ui.path=msg.path;
                if(!this.ui.path.endsWith('/')) {
                    this.ui.path+="/";
                }
                this.ui.pChild=[];
                await this.ui.Parse(msg.document.split(/\r\n|\n/), 0);
                console.log(this.ui);
            }
            break;
        }
    }

    isDirty:boolean=false;
    ui:zlUIMgr;
};

