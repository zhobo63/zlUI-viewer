import { ImGui,ImGui_Impl } from "@zhobo63/imgui-ts";
import { InspectorUI, Parser, ScaleMode, zlUIMgr } from "@zhobo63/zlui-ts";

export class App
{
    constructor()
    {
        window.addEventListener("keydown", (event: KeyboardEvent)=>{
            console.log(event);
            if(event.keyCode==113)  {
                this.isInspector=!this.isInspector;
            }
        });
    }

    async initialize():Promise<any>
    {
        this.ui=new zlUIMgr;
    }

    onResize(w:number, h:number)
    {
        this.w=w;
        this.h=h;
        this.ui.OnResize(w,h);
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
        if(ui.refresh_count>0)  {
        //if(ui.track.is_play) {
            this.isDirty=true;
        }
        if(this.isInspector) {
            ImGui.Begin("Inspector");            
            ImGui.Text("F2 show/hide Inspector");
            ImGui.Indent();
            ImGui.Text("Notify:" + (ui.notify?"["+ui.notify.line+"]"+ ui.notify.Name:""));
            ImGui.Text("Hover:" + (ui.hover?"["+ui.hover.line+"]"+ ui.hover.Name:""));
            ImGui.Text("Refresh Count:"+ui.refresh_count);
            ImGui.Text("Paint Count:"+ui.paint_count);
            ImGui.Text("CalRect Count:"+ui.calrect_count);
            ImGui.Unindent();
            if(ImGui.TreeNodeEx("UIMgr", ImGui.ImGuiTreeNodeFlags.DefaultOpen)) {
                InspectorUI(ui, 1);
                ImGui.TreePop();
            }
            ImGui.End();
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
                this.ui.scale_mode=ScaleMode.None;
                await this.ui.Parse(new Parser(msg.document));
                this.ui.OnResize(this.w, this.h);
                this.ui.SetCalRect();
                console.log(this.ui);
            }
            break;
        case "inspector":
            break;
        }
    }

    isDirty:boolean=false;
    isInspector:boolean=true;
    ui:zlUIMgr;
    w:number;
    h:number;
};

