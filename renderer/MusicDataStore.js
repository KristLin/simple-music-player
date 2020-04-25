const Store = require("electron-store");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

// electron store 例子
// store.set('foo.bar', true);
// console.log(store.get('foo'))
// store.delete('foo')

class DataStore extends Store {
  constructor(settings) {
    super(settings);
    this.musicFiles = this.get('musicFiles') || [];
  }

  saveMusicFiles() {
    this.set("musicFiles", this.musicFiles);
  }

  getMusicFiles() {
    return this.get("musicFiles") || [];
  }

  addMusicFiles(musicFiles) {
    const musicFilesWithProps = musicFiles
      .map((musicFile) => {
        return {
          id: uuidv4(),
          path: musicFile,
          fileName: path.basename(musicFile),
        };
      })
      .filter((musicFile) => {
        const currentMusicFiles = this.getMusicFiles().map(
          (musicFile) => musicFile.path
        );
        return currentMusicFiles.indexOf(musicFile.path) < 0;
      });
    this.musicFiles = [...this.musicFiles, ...musicFilesWithProps];
    this.saveMusicFiles();
  }

  deleteMusicFile(deleteId) {
    this.musicFiles = this.musicFiles.filter(music => music.id !== deleteId)
    this.saveMusicFiles();
  }
}

// 学习 module.exports 用法
module.exports = DataStore;
// 标准用法如下
// module.exports = {
//   method: function() {},
//   otherMethod: function() {},
// };
