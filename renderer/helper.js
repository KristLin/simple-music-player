exports.$ = (id) => {
  return document.getElementById(id);
};

exports.covertDuration = (time) => {
  const minutes = "0" + Math.floor(time / 60);
  const seconds = "0" + Math.floor(time - minutes * 60);
  // 这里的-2使用的是一个小技巧，即01 和 010取后两位结果都一样
  // 但无法处理3位数以上情况，需要后期考虑修改
  return minutes.substr(-2) + ":" + seconds.substr(-2);
};
