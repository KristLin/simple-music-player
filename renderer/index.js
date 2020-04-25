const { ipcRenderer } = require("electron");
const { $, covertDuration } = require("./helper");

let musicAudio = new Audio();
let allMusic;
let currentMusic;

$("add-music-button").addEventListener("click", () => {
  ipcRenderer.send("add-music-window");
});

// 显示已添加的音乐
const renderListHTML = (musicFiles) => {
  const musicList = $("musicList");
  const musicListHTML = musicFiles.reduce((html, music) => {
    html += `<li class="row music-file list-group-item d-flex justify-content-between align-center">
      <div class="col-10">
        <i class="iconfont icon-yinyue mr-4"></i>
        <b>${music.fileName}</b>
      </div>
      <div class="col-2">
        <i class="iconfont icon-bofang mr-4" data-id="${music.id}"></i>
        <i class="iconfont icon-shanchu" data-id="${music.id}"></i>
      </div>
    </li>`;
    return html;
  }, "");
  const emptyTrackHTML = `<div class="alert alert-primary">还没有添加任何音乐</div>`;
  musicList.innerHTML = musicFiles.length
    ? `<ul class="list-group">${musicListHTML}</ul>`
    : emptyTrackHTML;
};

ipcRenderer.on("load-music-file", (event, musicFiles) => {
  console.log("SIGNAL: load music");
  allMusic = musicFiles;
  renderListHTML(musicFiles);
});

// 处理点击事件
// Q: 是否可以直接给图标绑定 click 事件?
$("musicList").addEventListener("click", (event) => {
  event.preventDefault();
  const { dataset, classList } = event.target;
  // 学习dataset用法
  // 这句话还是不太理解
  const id = dataset && dataset.id
  // 播放歌曲
  if (id && classList.contains("icon-bofang")) {
    // 若选中的是当前歌曲，则继续播放
    if (currentMusic && currentMusic.id === id) {
      musicAudio.play();
      classList.replace("icon-bofang", "icon-zanting");
    } else {
      // 播放另一首歌曲，需要先替换掉原歌曲的暂停键
      // Q: 是否可以通过currentMusic找到该元素 将其还原？
      const pauseElement = document.querySelector(".icon-zanting");
      if (pauseElement) {
        pauseElement.classList.replace("icon-zanting", "icon-bofang");
      }

      // 播放新歌曲
      currentMusic = allMusic.find((music) => music.id === id);
      musicAudio.src = currentMusic.path;
      musicAudio.play();
      classList.replace("icon-bofang", "icon-zanting");
    }
  }
  // 暂停歌曲
  else if (id && classList.contains("icon-zanting")) {
    musicAudio.pause();
    classList.replace("icon-zanting", "icon-bofang");
  }
  // 删除歌曲
  else if (id && classList.contains("icon-shanchu")) {
    console.log(id);
    ipcRenderer.send("delete-music-file", id);
  }
});

// 播放歌曲信息
musicAudio.addEventListener("loadedmetadata", () => {
  const player = $("player-status");
  const html = `<div class="col font-weight-bold">
                  正在播放：${currentMusic.fileName}
                </div>
                <div class="col text-right">
                  <span id="current-seeker">00:00</span> / ${covertDuration(
                    musicAudio.duration
                  )}
                </div>`;
  player.innerHTML = html;
});

// 播放歌曲进度条
musicAudio.addEventListener("timeupdate", () => {
  const progress = Math.floor(
    (musicAudio.currentTime / musicAudio.duration) * 100
  );
  const bar = $("player-progress");
  bar.innerHTML = progress + "%";
  bar.style.width = progress + "%";

  const seeker = $("current-seeker");
  seeker.innerHTML = covertDuration(musicAudio.currentTime);
});
