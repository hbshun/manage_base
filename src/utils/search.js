/**
 * search brand
 *
 * 搜索范围：
 * 中文名、英文名、汉语拼音、自定义搜索词
 *
 * 搜索规则：
 * 1、中文名、英文名、汉语拼音、搜索词 其中之一完全命中时权重 +100
 * 2、开始命中时权重 +10
 * 3、中间或者结尾命中时权重 +1
 *
 * 排序：
 * 按权重值倒序
 */

/**
 * 搜索函数
 * @param data array 需要搜索的数据
 * @param str  string 搜索关键词
 */
export const search = (data, str) => {
  if (!data || data.length <= 0) {
    return []
  }

  // 搜索字符串转为小写
  let searchStr = str.trim().toLowerCase()
  let searchResult = []

  if (searchStr.length === 0) {
    return data
  }

  data.forEach(item => {
    // 设置排序权重
    let weight = 0

    item.searchList.forEach(searchItem => {
      // 搜索列表每项都转为小写
      searchItem = searchItem.toLowerCase()
      // 其中之一完全命中时权重 + 100
      if (searchStr == searchItem) {
        weight += 100
      } else {
        const index = searchItem.indexOf(searchStr)
        // 开始命中时权重 + 10
        if (index === 0) {
          weight += 10
        }
        // 中间或者结尾命中时权重 + 1
        else if (index > 0) {
          weight += 1
        }
        // 未命中时不增加权重
        else {
          weight += 0
        }
      }
    })

    // 权重为 0 时，表示没有被命中，不放入搜索结果集中
    if (weight > 0) {
      item.searchWeight = weight
      searchResult.push(item)
    }
  })

  // 排序 - 按权重倒序
  searchResult.sort((a, b) => {
    return b.searchWeight - a.searchWeight
    // if (a.searchWeight > b.searchWeight) {
    //   return -1;
    // }
    // else if (a.searchWeight < b.searchWeight) {
    //   return 1;
    // }
    // return 0;
  })

  return searchResult
}
