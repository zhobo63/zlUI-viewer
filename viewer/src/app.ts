import { ImGui,ImGui_Impl } from "@zhobo63/imgui-ts";
import * as SPINE from "./zlui-ts-spine/src/zlUISpine";
import { Parser, ScaleMode, UIMgr } from "./zlui-ts/src/zlUI";
import { BackendImGui, InspectorUI } from "./zlui-ts/src/BackendImGui";

const vscode=acquireVsCodeApi();

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
        this.ui=new UIMgr;
        this.ui.backend=new BackendImGui(ImGui.GetBackgroundDrawList());
        SPINE.Renderer.Register(this.ui, "");
        this.ui.on_click=(obj)=>{
            
            vscode.postMessage({
                cmd:"click",
                line:obj.line,
                version:1
            })
        }
    }

    onResize(w:number, h:number)
    {
        this.w=w;
        this.h=h;
        this.ui.OnResize(w,h);
        SPINE.spineRenderer.OnResize(w, h);
    }

    mainLoop(time:number)
    {
        let io=ImGui.GetIO();
        let ui=this.ui;
        ui.any_pointer_down=(!ImGui.GetHoveredWindow())?ImGui_Impl.any_pointerdown():false;
        ui.mouse_pos.Set(io.MousePos.x, io.MousePos.y);
        ui.mouse_wheel=io.MouseWheel;
        ui.Refresh(io.DeltaTime);
        ui.Paint();
        if(ui.refresh_count>0 || ui.track.is_play)  {
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
        console.log("onMessage", msg);
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
    isInspector:boolean=false;
    ui:UIMgr;
    w:number;
    h:number;
};

