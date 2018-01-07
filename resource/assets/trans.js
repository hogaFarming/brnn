const path = require('path');
const fs = require('fs');
const json1 = require('./brnn_images.json');
const json2 = require('./brnn_ani.json');
const json3 = require('./loading_light.json');

const jsons = [json1, json2, json3];
jsons.forEach(processJSON)
function processJSON(sourceJSON) {
  let ori_frames = sourceJSON.frames;
  let ori_imgs = sourceJSON.meta.image.split(',');
  
  let results = [];
  for (let key in ori_frames) {
    let src = ori_frames[key];
    let idx = src.frame.idx;
    let result = results[idx]
      || (results[idx] = { file: ori_imgs[idx], frames: {} });
    result.frames[key] = {
      x: src.frame.x,
      y: src.frame.y,
      w: src.frame.w,
      h: src.frame.h,
      offX: src.spriteSourceSize.x,
      offY: src.spriteSourceSize.y,
      sourceW: src.sourceSize.w,
      sourceH: src.sourceSize.h,
    }
  }
  
  results.forEach(json => {
    let ws = fs.createWriteStream(path.resolve(__dirname + '/results', json.file + '.json'));
    ws.write(JSON.stringify(json));
  })
}
