const { ipcRenderer } = require("electron");
const { $ } = require("./helper");
const path = require("path");

let musicFilePaths = [];

$("select-music-button").addEventListener("click", () => {
  ipcRenderer.send("open-music-file");
});

// 显示选择的音乐文件
const renderListHTML = (paths) => {
  const musicList = $("musicList");
  // 学习reduce用法
  const musicItemsHTML = paths.reduce((html, music) => {
    html += `<li class="list-group-item" style="font-size:12px">${path.basename(music)}</li>`;
    return html;
  }, "");
  // 插入HTML
  musicList.innerHTML = `<ul class="list-group">${musicItemsHTML}</ul>`;
};

ipcRenderer.on("selected-file", (event, paths) => {
  console.log("SIGNAL: selected file");
  renderListHTML(paths);
  musicFilePaths = paths;
});

$("import-music-button").addEventListener("click", () => {
  ipcRenderer.send("import-music-file", musicFilePaths);
});
