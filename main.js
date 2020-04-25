const { app, BrowserWindow, ipcMain, dialog, Menu } = require("electron");
const DataStore = require("./renderer/MusicDataStore");

/*隐藏electron创造的菜单栏*/
Menu.setApplicationMenu(null);

const myStore = new DataStore({
  name: "Music Data",
});

class AppWindow extends BrowserWindow {
  constructor(config, fileLocation) {
    const basicConfig = {
      width: 800,
      height: 600,
      // 无边框
      // frame: false,
      webPreferences: {
        nodeIntegration: true,
      },
    };

    // 旧版写法
    // const finalConfig = Object.assign(basicConfig, config)
    // 新版写法
    const finalConfig = { ...basicConfig, ...config };
    super(finalConfig);
    this.loadFile(fileLocation);
    this.setResizable(false);
    this.once("ready-to-show", () => {
      this.show();
    });
  }
}

app.on("ready", () => {
  const mainWindow = new AppWindow({}, "./renderer/index.html");
  // 主界面加载完成后 发送加载音乐列表的请求
  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.send("load-music-file", myStore.getMusicFiles());
  });

  ipcMain.on("add-music-window", (event, arg) => {
    console.log("SIGNAL: add music window");
    // event.sender 等同于 mainWindow
    const addWindow = new AppWindow(
      {
        width: 500,
        height: 450,
        parent: mainWindow,
      },
      "./renderer/add.html"
    );
  });

  ipcMain.on("open-music-file", (event) => {
    console.log("SIGNAL: open music file");

    dialog
      .showOpenDialog({
        properties: ["openFile", "multiSelections"],
        filters: [{ name: "Music", extensions: ["mp3"] }],
      })
      .then((result) => {
        // console.log(result.canceled);
        // console.log(result.filePaths);
        event.sender.send("selected-file", result.filePaths);
      })
      .catch((err) => {
        console.log(err);
      });
  });

  ipcMain.on("import-music-file", (event, musicFiles) => {
    console.log("SIGNAL: import music file");
    myStore.addMusicFiles(musicFiles);
    mainWindow.send("load-music-file", myStore.getMusicFiles());
  });

  ipcMain.on("delete-music-file", (event, id) => {
    console.log("SIGNAL: delete music file");
    myStore.deleteMusicFile(id);
    mainWindow.send("load-music-file", myStore.getMusicFiles());
  });
});
