import { Block, View, Navigator, RichText } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
// pages/usercenter/components/moreServices/components/helpCenter/helpCenter.js
import util from '../../../../../../utils/util.js'
import constant from '../../../../../../config/constant.js'

import DetailTmpl from '../../../../../../imports/DetailTmpl.js'
import ListTmpl from '../../../../../../imports/ListTmpl.js'
import './helpCenter.scss'

function depthData(data, id) {
  let arr = []
  listArr(data, arr)
  let childrenData,
    i = 0,
    len = arr.length
  for (; i < len; i++) {
    childrenData = arr[i]
    if (childrenData.id == id) {
      break
    }
  }
  return childrenData
}

function listArr(data, arr) {
  data.forEach(item => {
    arr.push(item)
    if (item.children.length > 0) {
      listArr(item.children, arr)
    }
  })
}

@withWeapp('Page')
class _C extends Taro.Component {
  state = {
    // help: [],
    helpList: []
  }
  componentWillMount = (options = this.$router.params || {}) => {
    if (options.id) {
      this.initChildrenData(options.id)
    } else {
      this.loadHelpData()
    }
  }
  componentDidShow = () => {}
  loadHelpData = id => {
    let _this = this
    let helpUrl = id == null ? constant.help : `${constant.help}${id}/`
    util.request({
      url: helpUrl,
      success: data => {
        // 为全局变量赋值
        wx.globalData.help = data
        // 格式化帮助中心列表数据
        _this.initListData(data)
      }
    })
  }
  initListData = data => {
    let helpList = data.map(item => {
      let redirectUrl =
        '/pages/usercenter/components/moreServices/components/helpCenter/helpCenter?id=' +
        item.id
      let redirectType = item.children.length <= 0 ? 'detail' : 'list'
      return {
        id: item.id,
        name: item.name,
        title: item.title,
        desc: item.desc,
        content: item.content,
        redirectUrl,
        redirectType
      }
    })
    this.setData({
      helpList
    })
  }
  initChildrenData = id => {
    const help = wx.globalData.help
    let childrenData = depthData(help, id)
    this.initListData(childrenData.children)
  }
  config = {
    navigationBarTitleText: '帮助中心',
    enablePullDownRefresh: false
  }

  render() {
    const { helpList: helpList } = this.state
    return (
      <View className="help-box mt30">
        {helpList.map((item, index) => {
          return (
            <Block key={'help-list' + index}>
              {item.redirectType === 'list' ? (
                <ListTmpl data={item}></ListTmpl>
              ) : (
                <DetailTmpl data={item}></DetailTmpl>
              )}
              {/*  帮助中心详情  */}
            </Block>
          )
        })}
      </View>
    )
  }
}

export default _C
