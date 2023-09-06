import {ImGui, ImGui_Impl} from '@zhobo63/imgui-ts';
import { ImVec4 } from '@zhobo63/imgui-ts/src/imgui';
import { App } from './app';

let lockTime=0;
let lockFps=1/5;
let prevTime=0;

let app:App=null;
let backgroundColor:ImVec4;

function _loop(time:number):void {
    let ti=(time-prevTime)*0.001;
    prevTime=time;
    lockTime+=ti;
    if(lockTime<lockFps && !app.isDirty)  {
        window.requestAnimationFrame(_loop);
        return;
    }
    app.isDirty=false;
    lockTime=0;

    ImGui_Impl.NewFrame(time);
    ImGui.NewFrame();

    if(app) {
        app.mainLoop(time, ImGui.GetBackgroundDrawList());
    }

    ImGui.EndFrame();
    ImGui.Render();

    ImGui_Impl.ClearBuffer(backgroundColor);
    ImGui_Impl.RenderDrawData(ImGui.GetDrawData());

    window.requestAnimationFrame(_loop);
}

function anyPointer(e:Event)
{
    app.isDirty=true;
}

window.addEventListener('DOMContentLoaded', async () =>{
    await ImGui.default();
    ImGui.CHECKVERSION();
    ImGui.CreateContext();
    let io=ImGui.GetIO();
    let font=io.Fonts.AddFontDefault();
    font.FontName="arial";
    font.FontStyle="bold";
    font.FontSize=16;    
    if(ImGui.isMobile.any())    {
        font.FontSize=20;
    }

    const canvas:HTMLCanvasElement=document.getElementById('canvas') as HTMLCanvasElement;
    ImGui_Impl.Init(canvas);

    console.log("FontScale", ImGui_Impl.font_scale);
    console.log("CanvasScale", ImGui_Impl.canvas_scale);

    app=new App;
    await app.initialize();
    if(app) {
        app.onResize(canvas.scrollWidth, canvas.scrollHeight);
    }

    window.addEventListener("pointerdown", anyPointer);
    window.addEventListener("pointerup", anyPointer);
    window.addEventListener("pointermove", anyPointer);
    window.addEventListener("keydown", anyPointer);
    window.addEventListener("keyup", anyPointer);
    window.addEventListener("keypress", anyPointer);
    window.addEventListener("message", e=>{app.onMessage(e.data);});

    window.onresize=()=>{
        if(app) {app.onResize(canvas.scrollWidth, canvas.scrollHeight);}
    };
    let style=ImGui.GetStyle();
    style.WindowRounding=4;
    style.FrameRounding=4;
    style.FrameBorderSize=1;
    style.ChildRounding=4;
    style.PopupRounding=4;
    style.WindowMinSize.Set(200,160);
    style.Colors[ImGui.ImGuiCol.PopupBg].Set(0.2,0.2,0.2,1);

    backgroundColor=new ImVec4(23/255,26/255,29/255,1);
    
    console.log(style);

    window.requestAnimationFrame(_loop);
});
