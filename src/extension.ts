// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const version="001"

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	console.log("zlui-viewer " + version + " is now active!");

	let disposable = vscode.commands.registerCommand('zlui-viewer.show', () => {		
		vscode.window.showInformationMessage('show zlUI-Viewer ' + version);
		UIPreviewPanel.show(context, undefined);
	});

	context.subscriptions.push(disposable);

	vscode.window.onDidChangeActiveTextEditor(()=>{
		let zluiFileActive=false;
		let document=vscode.window.activeTextEditor?.document;
		if(document?.fileName.endsWith(".ui"))	{
			vscode.commands.executeCommand("zlui-viewer.show");
			setImmediate(()=>UIPreviewPanel.show(context, document));
			zluiFileActive=true;
		}

		vscode.commands.executeCommand('setContext', 'zluiFileActive', zluiFileActive);
	});
}

// This method is called when your extension is deactivated
export function deactivate() {
	if(UIPreviewPanel.previewPanel) {
		delete UIPreviewPanel.previewPanel;
	}
}


class UIPreviewPanel {

	static previewPanel?:UIPreviewPanel;


	static show(context:vscode.ExtensionContext, doc:vscode.TextDocument|undefined) {

		if(!this.previewPanel)	{
			this.previewPanel=new UIPreviewPanel(context);
		}
		if(doc) {
			this.previewPanel.update(doc);
		}
	}

	constructor(context:vscode.ExtensionContext)
	{
		let document=vscode.window.activeTextEditor?.document;
		let filepath=document?.fileName||"";

		let localResourceRoots = [
			vscode.Uri.file(context.extensionPath),
			vscode.Uri.file(path.dirname(filepath)),
		];

		console.log(localResourceRoots);

		this.panel = vscode.window.createWebviewPanel(
			"zlui.preview",
			"zlUI-Preview",
			vscode.ViewColumn.Two,
			{
				enableScripts:true,
				localResourceRoots:localResourceRoots
			}
		);			
		this.panel.onDidDispose(e=>{
			delete UIPreviewPanel.previewPanel;
		});

		let html=fs.readFileSync(context.asAbsolutePath('www/index.html'), 'utf-8');
		const mainjsUri = this.panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'www/js', 'main.js'));
		html=html.replace("js/main.js", `${mainjsUri}`);

		//console.log(html);
		this.panel.webview.html = html;

		vscode.workspace.onDidSaveTextDocument((doc)=>{
			this.update(doc);
		});
		//this.watchFile();
	}

	getPath(p:string):string
	{
		for(let i=p.length-1;i>=0;i--)	{
			switch(p.charAt(i)) {
				case '\\':
				case '/':
					return p.slice(0,i+1);
			}
		}
		return p;
	}

	update(doc:vscode.TextDocument)
	{
		console.log("UIPreviewPanel Update");		
		let editor=vscode.window.activeTextEditor;

		let dir=this.panel?.webview.asWebviewUri(doc.uri);
		this.panel?.webview.postMessage({
			cmd:"update",
			document:doc.getText(),
			filename:doc.fileName,
			path:path.dirname(`${dir}`)
			});
		this.panel?.webview.onDidReceiveMessage((e)=>{
			console.log("onDidReceiveMessage", e);
			switch(e.cmd) {
			case 'click':
				let range=doc.lineAt(e.line).range;
				console.log(editor?.document);
				if(editor && range) {
					//editor.selection=new vscode.Selection(range.start, range.end);
					editor.revealRange(range, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
					//console.log(doc.getText());
					console.log("range", range);
				}
				break;
			}
		})
	}

	watchFile()
	{
		let doc=vscode.window.activeTextEditor?.document;		
		if(!doc) {
			return;
		}
		let path=doc.fileName;
		if(path && doc) {
			this.watchers?.push(fs.watch(path, ()=>{
				this.update(doc as vscode.TextDocument);
			}));
		}
	}

	panel:vscode.WebviewPanel|null=null;
	watchers:Array<fs.FSWatcher>=[];
}

