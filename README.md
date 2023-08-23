# zlui-viewer README

Preview zlUI, default file ext: *.ui

## Features

* Structure

```
Object Panel
{

    // child object
    Object Button
    {
        Name btn_ok   

        Object Panel
        {
            Name pnl_icon
        }
    }

    // clone previous object by name
    Clone btn_ok
    {

        // set child parameter by name
        Param pnl_icon
        {

        }
    }
}
```

* Object Type

Win

```
//create

Object Win
{
    //parameter
}

```

Image extend Win

Panel extend Image

Edit extend Panel

Button extend Panel

Check extend Button

Combo extend Button

Slider extend Panel


## Requirements

UI system rendering base on @zhobo63\imgui-ts

## Extension Settings

## Release Notes

### 0.0.1

Initial release of zlUI-Viewer

