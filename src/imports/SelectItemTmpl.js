import ChooseFeatureTmpl from './ChooseFeatureTmpl'
import { Block, View, Image, Text, ScrollView, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
export default class SelectItemTmpl extends Taro.Component {
  render() {
    const {
      data: {
        tab: tab,
        isShowSearch: isShowSearch,
        hasTab: hasTab,
        tabShow: tabShow,
        inputVal: inputVal,
        arrangeItem: arrangeItem,
        index: index,
        item: item,
        canShare: canShare
      }
    } = this.props
    return (
      <Block>
        <View
          className={
            'page ' +
            (tab.tabShow == '' && !isShowSearch ? 'hide-fixed' : 'fixed-nav')
          }
          id="select-top"
        >
          {hasTab && (
            <Block>
              <View className="page_tab">
                <View
                  className={
                    'tab ' +
                    (tab.tabShow == '' ? 'white-tabShow' : 'gray-tabShow')
                  }
                >
                  <View
                    className={
                      'nav-bar ' +
                      (tab.tabShow == 'arrange' ? 'current-tab' : '') +
                      '  ' +
                      (tabShow.arrange.name == tabShow.arrange.showName
                        ? ''
                        : 'choose-tab')
                    }
                    data-hi="arrange"
                    onClick={this.showTab}
                  >
                    {tabShow.arrange.showName}
                    <I
                      className={
                        'sparrow-icon ' +
                        (tab.tabShow == 'arrange'
                          ? 'icon-newPPzhengsanjiao'
                          : 'icon-newPPdaosanjiao')
                      }
                      data-hi="arrange"
                    ></I>
                  </View>
                  {tab.other[0].values.length > 0 && (
                    <View
                      className={
                        'nav-bar ' +
                        (tab.tabShow == 'other' ? 'current-tab' : '') +
                        '  ' +
                        (tabShow.other.name == tabShow.other.showName
                          ? ''
                          : 'choose-tab')
                      }
                      data-hi="other"
                      onClick={this.showTab}
                    >
                      {tabShow.other.showName}
                      <I
                        className={
                          'sparrow-icon ' +
                          (tab.tabShow == 'other'
                            ? 'icon-newPPzhengsanjiao'
                            : 'icon-newPPdaosanjiao')
                        }
                        data-hi="other"
                      ></I>
                    </View>
                  )}
                  {(tab.proAndSer[0].values.length > 0 ||
                    tab.proAndSer[1].values.length > 0) && (
                    <View
                      className={
                        'nav-bar ' +
                        (tab.tabShow == 'proAndSer' ? 'current-tab' : '') +
                        '  ' +
                        (tabShow.proAndSer.name == tabShow.proAndSer.showName
                          ? ''
                          : 'choose-tab')
                      }
                      data-hi="proAndSer"
                      onClick={this.showTab}
                    >
                      {tabShow.proAndSer.showName}
                      <I
                        className={
                          'sparrow-icon ' +
                          (tab.tabShow == 'proAndSer'
                            ? 'icon-newPPzhengsanjiao'
                            : 'icon-newPPdaosanjiao')
                        }
                        data-hi="proAndSer"
                      ></I>
                    </View>
                  )}
                  <View
                    className={
                      'nav-bar ' +
                      (tab.tabShow == 'filters' ? 'current-tab' : '') +
                      '  ' +
                      (tabShow.filters.name == tabShow.filters.showName
                        ? ''
                        : 'choose-tab')
                    }
                    data-hi="filters"
                    onClick={this.showTab}
                  >
                    筛选
                    <I
                      className={
                        'sparrow-icon ' +
                        (tab.tabShow == 'filters'
                          ? 'icon-newPPzhengsanjiao'
                          : 'icon-newPPdaosanjiao')
                      }
                      data-hi="filters"
                    ></I>
                  </View>
                  {/*  搜索按钮  */}
                  <View
                    className={
                      'search-item ' + (isShowSearch ? 'white-tabShow' : '')
                    }
                    onClick={this.showSearch}
                  >
                    <I
                      className={
                        'sparrow-icon icon-search def-search ' +
                        (isShowSearch ? 'choose-tab' : '')
                      }
                    ></I>
                  </View>
                </View>
                {/*  搜索框  */}
                {isShowSearch && (
                  <Block>
                    <View className="search-nav" id="search-nav-def">
                      <View className="search-main">
                        <I className="sparrow-icon icon-search def-search-icon"></I>
                        {/*  搜索input  */}
                        <Input
                          type="text"
                          className="search-input"
                          placeholder="在品牌内搜索"
                          value={inputVal}
                          onInput={this.inputTyping}
                          onConfirm={this.searchCommit}
                          confirmType="search"
                          adjustPosition="false"
                        ></Input>
                        {/*  清空的图标  */}
                        {inputVal !== '' && (
                          <Block>
                            <View
                              className="clear-search-btn"
                              onClick={this.clearInput}
                            >
                              <I className="sparrow-icon icon-clear def-icon-clear"></I>
                            </View>
                          </Block>
                        )}
                      </View>
                      <Span className="cancel-search" onClick={this.hideSearch}>
                        取消
                      </Span>
                    </View>
                  </Block>
                )}
                {/* tab排序 */}
                {tab.tabShow == 'arrange' && (
                  <Block>
                    <View className="tab-panel">
                      {arrangeItem.map((item, index) => {
                        return (
                          <View
                            className={
                              'arrange-span ' +
                              (tab.arrangeType == index ? 'arrange-red' : '')
                            }
                            data-type={index}
                            data-text={item}
                            onClick={this.chooseArrange}
                            key={'arrange-item-' + index}
                          >
                            {item}
                          </View>
                        )
                      })}
                    </View>
                  </Block>
                )}
                {/* tab */}
                {tab.tabShow == 'other' && (
                  <Block>
                    <ChooseFeatureTmpl
                      data={{
                        arr: (tab.other, canShare)
                      }}
                    ></ChooseFeatureTmpl>
                  </Block>
                )}
                {/* tab活动服务  */}
                {tab.tabShow == 'proAndSer' && (
                  <Block>
                    <ChooseFeatureTmpl
                      data={{
                        arr: (tab.proAndSer, canShare)
                      }}
                    ></ChooseFeatureTmpl>
                  </Block>
                )}
                {/* tab筛选 */}
                {tab.tabShow == 'filters' && (
                  <Block>
                    <View className="filter-div">
                      <View className="price-field">
                        <View className="price-field-word">价格区间（元）</View>
                        <View className="price-field-input-div">
                          <Input
                            placeholder="最低价"
                            onInput={this.inputPrice}
                            className="price-field-input"
                            type="number"
                            data-price="min"
                            value={tab.price.min}
                          ></Input>
                          <Span>—</Span>
                          <Input
                            placeholder="最高价"
                            onInput={this.inputPrice}
                            className="price-field-input"
                            type="number"
                            data-price="max"
                            value={tab.price.max}
                          ></Input>
                        </View>
                      </View>
                      <ChooseFeatureTmpl
                        data={{
                          arr: (tab.filters, canShare)
                        }}
                      ></ChooseFeatureTmpl>
                    </View>
                  </Block>
                )}
              </View>
            </Block>
          )}
          {/* 选择各种筛选条件时出现的蒙版 */}
          {(tab.tabShow == 'arrange' ||
            tab.tabShow == 'other' ||
            tab.tabShow == 'proAndSer' ||
            tab.tabShow == 'filters') && (
            <Block>
              <View className="tab-mask-in" onClick={this.hideTab}></View>
            </Block>
          )}
        </View>
      </Block>
    )
  }

  static options = {
    addGlobalClass: true
  }
}
