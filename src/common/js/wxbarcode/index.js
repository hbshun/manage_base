import Taro from '@tarojs/taro'
var barcode = require('./barcode.js')
var qrcode = require('./qrcode.js')

function convert_length(length) {
  return Math.round((Taro.getSystemInfoSync().windowWidth * length) / 750)
}

function barc(id, code, width, height) {
  barcode.code128(
    Taro.createCanvasContext(id),
    code,
    convert_length(width),
    convert_length(height)
  )
}

function qrc(id, code, width, height) {
  qrcode.api.draw(code, {
    ctx: Taro.createCanvasContext(id),
    width: convert_length(width),
    height: convert_length(height)
  })
}

module.exports = {
  barcode: barc,
  qrcode: qrc
}
