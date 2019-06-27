import Taro from '@tarojs/taro'
/**
 * wx.showModal
 */

/**
 * 错误提示框
 */
export const showModalError = message => {
  Taro.showModal({
    title: '错误提示',
    content: message || '服务器错误，请稍后再试',
    showCancel: false
  })
}

/**
 * 显示信息框
 */
export const showModalMsg = obj => {
  Taro.showModal({
    title: obj.title || '提示',
    content: obj.content,
    showCancel: false
  })
}

/**
 * 确认框
 */
export const showModalConfirm = obj => {
  Taro.showModal({
    title: obj.title || '提示',
    content: obj.content,
    success: res => {
      if (res.confirm && !res.cancel) {
        obj.confirm()
      } else {
        obj.cancel()
      }
    }
  })
}

/**
 * 请求 request
 */
export const request = (obj, funcAuthor) => {
  // console.log('----> loginStatus: ', wx.loginStatus);
  const startTime = Date.now()
  /**
   * 设置请求参数
   */
  const requestObj = {
    url: obj.url,
    data: obj.data,
    header: obj.header,
    method: obj.method,
    dataType: obj.dataType,
    success: res => {
      // data	开发者服务器返回的数据
      // statusCode	开发者服务器返回的状态码
      // header	开发者服务器返回的 HTTP Response Header
      if (res.statusCode >= 200 && res.statusCode < 300) {
        let data = res.data
        // 处理 204 不返回数据前端解析报错的问题
        if (res.statusCode === 204) {
          data = null
        }
        obj.success(data)
        // console.log('请求成功：' + res.statusCode + '; url=' + obj.url);
      } else {
        // 调用失败回调函数
        obj.fail && obj.fail(res.data)
        // 错误分类处理
        if (res.statusCode >= 500) {
          Taro.hideToast()
          showModalError('服务器错误，请稍候重试')
          // console.error('服务器错误：' + res.statusCode + '; url=' + obj.url);
        } else if (res.statusCode >= 400) {
          // console.error('----->', res);
          /**
           * 401 时用户登录状态失效，重新登录并请求数据。
           */
          if (res.statusCode === 401) {
            // 重新登录不能去掉转菊花
            funcAuthor && funcAuthor()
          } else if (res.statusCode === 403) {
            // 会员卡被冻结，返回错误信息
            showModalError(
              '您的会员卡存在异常，请联系顾客服务中心(010)63608662。服务时间10：00~22：00'
            )
          } else if (res.statusCode === 400 && res.data.code == -1401) {
            // 这个其实是后台拿不到union_id返回的错误，但是有可能再点击几次就能拿到，为了让用户点击多次显示为网络错误
            showModalError('网络错误，请稍候重试')
          } else {
            // 显示错误信息
            Taro.hideToast()
            showModalError(res.data.message)
            console.error('请求错误：' + res.statusCode + '; url=' + obj.url)
            if (res.data.errors) {
              res.data.errors.forEach(errorObj => {
                console.log(`${errorObj.field}: ${errorObj.message}`)
              })
            }
          }
        } else {
          Taro.hideToast()
          showModalError('其他错误，请稍后重试')
          console.error('其他错误：' + res.statusCode + '; url=' + obj.url)
        }
      }
    },
    fail: error => {
      // 调用失败函数
      obj.fail && obj.fail(error)
      showModalError('网络不给力，请检查网络设置')
      console.error('wx.request fail: url=' + obj.url, error)
    },
    complete: () => {
      obj.complete && obj.complete()
      // const endTime = Date.now();
      // console.log('====> 请求时间：', obj.url, endTime - startTime);
    }
  }

  Taro.request(requestObj)
}
